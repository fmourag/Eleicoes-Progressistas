import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import { getNumeroUrna } from '@np/shared';
import { ColaCandidateItemDto, GenerateColaPdfDto } from './dto/cola.dto';
import { PrismaService } from '../common/prisma.service';
import { AdsService } from '../ads/ads.service';

const VOTING_ORDER: string[] = [
  'DEPUTADO_FEDERAL',
  'DEPUTADO_ESTADUAL',
  'DEPUTADO_DISTRITAL',
  'SENADOR',
  'GOVERNADOR',
  'PRESIDENTE',
  'VEREADOR',
  'PREFEITO',
];

// Constantes oficiais de Apoio Cívico / Financiamento Coletivo
const PIX_KEY_CELULAR_DISPLAY = '(21) 97194-3298';
const PIX_KEY_E164 = '+5521971943298';
const PIX_BENEFICIARY = 'Fernando Goncalves';
const PIX_CITY = 'Rio de Janeiro';
const WEB_APP_URL = 'https://eleicoes-progressistas.onrender.com/web/';

/**
 * Funções auxiliares para geração do payload EMVCo BR Code (Padrão Banco Central do Brasil)
 */
function formatTlv(id: string, value: string): string {
  const len = Buffer.byteLength(value, 'utf8');
  return id + len.toString().padStart(2, '0') + value;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generatePixPayload(
  key = PIX_KEY_E164,
  name = PIX_BENEFICIARY,
  city = PIX_CITY,
  amount = 3.0,
): string {
  let payload = '';
  payload += formatTlv('00', '01'); // Payload Format Indicator
  payload += formatTlv('01', '12'); // Point of Initiation (QR Code Dinâmico / Estático)

  // Merchant Account Information (GUI + Chave Pix)
  const mai = formatTlv('00', 'BR.GOV.BCB.PIX') + formatTlv('01', key);
  payload += formatTlv('26', mai);

  payload += formatTlv('52', '0000'); // Merchant Category Code
  payload += formatTlv('53', '986'); // BRL
  if (amount && amount > 0) {
    payload += formatTlv('54', amount.toFixed(2));
  }
  payload += formatTlv('58', 'BR');
  payload += formatTlv(
    '59',
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 25),
  );
  payload += formatTlv(
    '60',
    city
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 15),
  );

  // Additional Data Field (TXID)
  payload += formatTlv('62', formatTlv('05', '***'));

  // CRC16 Checksum
  payload += '6304';
  const checksum = crc16(payload);
  return payload + checksum;
}

@Injectable()
export class ColaService {
  private readonly logger = new Logger(ColaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adsService: AdsService,
  ) {}

  /**
   * Busca candidatos no banco pelo array de IDs caso a requisição venha simplificada.
   */
  async getCandidatesByIds(ids: string[]): Promise<ColaCandidateItemDto[]> {
    if (!ids || ids.length === 0) return [];

    try {
      const dbCandidates = await this.prisma.candidate.findMany({
        where: { id: { in: ids } },
      });

      return dbCandidates.map((c) => ({
        id: c.id,
        name: c.name,
        socialName: c.socialName ?? undefined,
        viceName: (c as any).viceName ?? undefined,
        cargo: c.cargo,
        party: c.party,
        partyNumber: c.partyNumber ?? undefined,
        numeroUrna: (c as any).numeroUrna ?? undefined,
        tseId: c.tseId ?? undefined,
        photoUrl: c.photoUrl ?? undefined,
        state: c.state ?? undefined,
        municipality: c.municipality ?? undefined,
        fichaLimpa: c.fichaLimpa,
      }));
    } catch (err) {
      this.logger.warn(`Erro ao buscar candidatos por ID para cola: ${err}`);
      return [];
    }
  }

  /**
   * Localiza o logotipo oficial do aplicativo no disco.
   */
  private resolveAppLogoPath(): string | null {
    const searchPaths = [
      path.resolve(process.cwd(), 'apps/api/static/logo.png'),
      path.resolve(process.cwd(), 'apps/api/public/logo.png'),
      path.resolve(process.cwd(), 'static/logo.png'),
      path.resolve(process.cwd(), 'apps/mobile/assets/icon.png'),
      path.resolve(__dirname, '../../../../apps/api/static/logo.png'),
      path.resolve(__dirname, '../../../../static/logo.png'),
      path.resolve(__dirname, '../../../static/logo.png'),
      path.resolve(__dirname, '../../static/logo.png'),
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        try {
          if (fs.statSync(p).isFile()) return p;
        } catch {}
      }
    }
    return null;
  }

  /**
   * Localiza com segurança a imagem do candidato no disco ou faz fetch remoto.
   */
  async resolveCandidateImage(cand: ColaCandidateItemDto): Promise<string | Buffer | null> {
    const searchDirs = [
      path.resolve(process.cwd(), 'apps/api/public/candidates'),
      path.resolve(process.cwd(), 'apps/api/static/candidates'),
      path.resolve(process.cwd(), 'apps/api/static/web/candidates'),
      path.resolve(process.cwd(), 'static/candidates'),
      path.resolve(process.cwd(), 'public/candidates'),
      path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
      path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
      path.resolve(__dirname, '../../../../apps/api/public/candidates'),
      path.resolve(__dirname, '../../../../apps/api/static/candidates'),
      path.resolve(__dirname, '../../../../static/candidates'),
      path.resolve(__dirname, '../../../static/candidates'),
      path.resolve(__dirname, '../../static/candidates'),
      path.resolve(__dirname, '../static/candidates'),
    ];

    const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    const fileNamesToTry = new Set<string>();

    const sanitizeToken = (token?: string): string => {
      if (!token) return '';
      return path.basename(token).replace(/[^a-zA-Z0-9_-]/g, '');
    };

    const cleanTseId = sanitizeToken(cand.tseId);
    if (cleanTseId) {
      fileNamesToTry.add(`${cleanTseId}.jpg`);
      fileNamesToTry.add(`${cleanTseId}.png`);
      fileNamesToTry.add(`${cleanTseId}.jpeg`);
    }

    if (cand.photoUrl) {
      const cleanUrl = cand.photoUrl.split(/[?#]/)[0];
      const baseName = path.basename(cleanUrl).replace(/[^a-zA-Z0-9._-]/g, '');
      const ext = path.extname(baseName).toLowerCase();
      if (baseName && !baseName.includes('..') && ALLOWED_EXTS.has(ext)) {
        fileNamesToTry.add(baseName);
      }
    }

    const cleanId = sanitizeToken(cand.id);
    if (cleanId) {
      fileNamesToTry.add(`${cleanId}.jpg`);
      fileNamesToTry.add(`${cleanId}.png`);
    }

    // 1. Busca nos diretórios locais
    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      const resolvedDir = path.resolve(dir);
      for (const fileName of fileNamesToTry) {
        const fullPath = path.resolve(resolvedDir, fileName);
        if (fullPath.startsWith(resolvedDir) && fs.existsSync(fullPath)) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile() && stat.size > 0) {
              return fullPath;
            }
          } catch {}
        }
      }
    }

    // 2. Se não achou localmente e photoUrl for HTTP/HTTPS, tenta download seguro
    if (cand.photoUrl && /^https?:\/\//i.test(cand.photoUrl)) {
      try {
        const res = await axios.get(cand.photoUrl, {
          responseType: 'arraybuffer',
          timeout: 3000,
          headers: { 'User-Agent': 'EleicoesProgressistas/2.2' },
        });
        if (res.status === 200 && res.data) {
          return Buffer.from(res.data);
        }
      } catch (err) {
        this.logger.debug(`Falha ao baixar foto remota para ${cand.name}: ${err}`);
      }
    }

    return null;
  }

  /**
   * Gera o PDF completo da Cola Eleitoral com fotos, logotipo, QR Codes e bloco de ajuda cívica.
   */
  async generatePdf(dto: GenerateColaPdfDto): Promise<Buffer> {
    const candidates = [...dto.candidates];

    // Ordena os candidatos na sequência oficial da urna eletrônica
    candidates.sort((a, b) => {
      const indexA = VOTING_ORDER.indexOf(a.cargo.toUpperCase());
      const indexB = VOTING_ORDER.indexOf(b.cargo.toUpperCase());
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });

    // Pré-carrega fotos dos candidatos em paralelo
    const candidateImages = await Promise.all(
      candidates.map((c) => this.resolveCandidateImage(c)),
    );

    // Gera QR Codes necessários em paralelo
    const appQrUrl = dto.state
      ? `${WEB_APP_URL}?uf=${encodeURIComponent(dto.state)}`
      : WEB_APP_URL;

    const [appQrBuffer, pixQrBuffer] = await Promise.all([
      QRCode.toBuffer(appQrUrl, { width: 140, margin: 1, errorCorrectionLevel: 'M' }).catch(
        () => null,
      ),
      QRCode.toBuffer(generatePixPayload(), {
        width: 140,
        margin: 1,
        errorCorrectionLevel: 'M',
      }).catch(() => null),
    ]);

    const logoPath = this.resolveAppLogoPath();

    return new Promise(async (resolve, reject) => {
      // Criação do documento PDF em formato A4
      const doc = new PDFDocument({
        size: 'A4',
        margin: 24,
        info: {
          Title: 'Cola Eleitoral 2026 - Eleições Progressistas',
          Author: 'Eleições Progressistas',
          Subject: 'Colinha Oficial do Eleitor para o Dia da Votação',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const margin = 24;
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - margin * 2;

      // ─────────────────────────────────────────────────────────────
      // 1. CABEÇALHO CÍVICO COM LOGOTIPO E QR CODE DO GUIA ONLINE
      // ─────────────────────────────────────────────────────────────
      const headerY = 16;
      const headerHeight = 56;

      // Fundo Verde Emerald 700
      doc.rect(margin, headerY, contentWidth, headerHeight).fill('#047857');
      // Faixa Amarela Amber 500
      doc.rect(margin, headerY + headerHeight - 3, contentWidth, 3).fill('#F59E0B');

      let textStartX = margin + 12;

      // Desenha o Logotipo se disponível
      if (logoPath) {
        try {
          const logoSize = 42;
          doc.image(logoPath, margin + 8, headerY + 6, {
            fit: [logoSize, logoSize],
            align: 'center',
            valign: 'center',
          });
          textStartX = margin + 56;
        } catch {}
      }

      // QR Code do Guia Online no Cabeçalho (topo direito)
      const qrSize = 44;
      const qrX = margin + contentWidth - qrSize - 8;
      const qrY = headerY + 5;
      if (appQrBuffer) {
        try {
          doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4).fill('#FFFFFF');
          doc.image(appQrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });
          doc.fillColor('#065F46')
            .font('Helvetica-Bold')
            .fontSize(5.5)
            .text('GUIA ONLINE', qrX - 4, qrY + qrSize + 1, {
              width: qrSize + 8,
              align: 'center',
            });
        } catch {}
      }

      const titleMaxWidth = contentWidth - (textStartX - margin) - (qrSize + 20);

      // Título e Subtítulos
      doc.fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('ELEIÇÕES PROGRESSISTAS 2026', textStartX, headerY + 8, {
          width: titleMaxWidth,
        });

      doc.fillColor('#FDE68A')
        .font('Helvetica-Bold')
        .fontSize(7.8)
        .text('JUSTIÇA ELEITORAL • COLA OFICIAL DO ELEITOR', textStartX, headerY + 23, {
          width: titleMaxWidth,
        });

      const ufText = dto.state ? `ESTADO: ${dto.state.toUpperCase()}` : 'CIRCUNSCRIÇÃO NACIONAL';
      const munText = dto.municipality ? ` • ${dto.municipality}` : '';
      const dateText = new Date().toLocaleDateString('pt-BR');

      doc.fillColor('#D1FAE5')
        .font('Helvetica')
        .fontSize(7)
        .text(
          `"Cheque o passado. Escolha o futuro." • ${ufText}${munText} • EMISSÃO: ${dateText}`,
          textStartX,
          headerY + 36,
          { width: titleMaxWidth },
        );

      // ─────────────────────────────────────────────────────────────
      // 2. AVISO LEGAL DO TSE (RESOLUÇÃO 23.736/2024)
      // ─────────────────────────────────────────────────────────────
      const alertY = headerY + headerHeight + 5;
      const alertHeight = 28;
      doc.rect(margin, alertY, contentWidth, alertHeight).fillAndStroke('#FEF3C7', '#F59E0B');

      doc.fillColor('#92400E')
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .text('AVISO OFICIAL DO TSE (Resolução nº 23.736/2024):', margin + 8, alertY + 4);

      doc.fillColor('#78350F')
        .font('Helvetica')
        .fontSize(6.8)
        .text(
          'É PERMITIDO levar esta colinha impressa em papel para a cabine de votação. É PROIBIDO entrar na cabine com celular, câmera ou filmadora.',
          margin + 8,
          alertY + 14,
          { width: contentWidth - 16 },
        );

      // ─────────────────────────────────────────────────────────────
      // 3. CARTÕES DOS CANDIDATOS NA ORDEM DA URNA
      // ─────────────────────────────────────────────────────────────
      let currentY = alertY + alertHeight + 6;

      // Altura responsiva dos cards para garantir 1 página A4 sem transbordar
      const totalCandidates = candidates.length;
      let cardHeight = 74;
      let cardSpacing = 5;

      if (totalCandidates <= 3) {
        cardHeight = 96;
        cardSpacing = 8;
      } else if (totalCandidates <= 5) {
        cardHeight = 84;
        cardSpacing = 6;
      } else if (totalCandidates === 6) {
        cardHeight = 74;
        cardSpacing = 4;
      } else {
        cardHeight = 62;
        cardSpacing = 3;
      }

      if (totalCandidates === 0) {
        doc.rect(margin, currentY, contentWidth, 60).fillAndStroke('#F3F4F6', '#D1D5DB');
        doc.fillColor('#4B5563')
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('Nenhum candidato selecionado na cola.', margin + 20, currentY + 24, {
            align: 'center',
            width: contentWidth - 40,
          });
        currentY += 70;
      }

      let senatorCount = 0;
      for (let i = 0; i < totalCandidates; i++) {
        const cand = candidates[i];
        let title = '';
        let orderLabel = '';
        let digitsCount = 2;

        const rawCargo = cand.cargo.toUpperCase();
        if (rawCargo === 'DEPUTADO_FEDERAL') {
          title = 'DEPUTADO(A) FEDERAL';
          digitsCount = 4;
          orderLabel = '1º A VOTAR';
        } else if (rawCargo === 'DEPUTADO_ESTADUAL' || rawCargo === 'DEPUTADO_DISTRITAL') {
          title = rawCargo === 'DEPUTADO_DISTRITAL' ? 'DEPUTADO(A) DISTRITAL' : 'DEPUTADO(A) ESTADUAL';
          digitsCount = 5;
          orderLabel = '2º A VOTAR';
        } else if (rawCargo.startsWith('SENADOR')) {
          senatorCount++;
          title = senatorCount === 1 ? 'SENADOR(A) — 1ª VAGA' : 'SENADOR(A) — 2ª VAGA';
          digitsCount = 3;
          orderLabel = senatorCount === 1 ? '3º A VOTAR' : '4º A VOTAR';
        } else if (rawCargo === 'GOVERNADOR') {
          title = 'GOVERNADOR(A)';
          digitsCount = 2;
          orderLabel = '5º A VOTAR';
        } else if (rawCargo === 'PRESIDENTE') {
          title = 'PRESIDENTE DA REPÚBLICA';
          digitsCount = 2;
          orderLabel = '6º A VOTAR';
        } else {
          title = rawCargo.replace(/_/g, ' ');
          digitsCount = 2;
          orderLabel = `${i + 1}º A VOTAR`;
        }

        const resolvedNumber =
          cand.numeroUrna ||
          getNumeroUrna({
            cargo: cand.cargo,
            partyNumber: cand.partyNumber,
            party: cand.party,
            tseId: cand.tseId,
            name: cand.name,
          });

        // Fundo do Card
        doc.rect(margin, currentY, contentWidth, cardHeight).fillAndStroke(
          '#FFFFFF',
          '#E2E8F0',
        );

        // Barra de Título do Cargo
        const cargoHeaderHeight = 18;
        doc.rect(margin, currentY, contentWidth, cargoHeaderHeight).fill('#1E293B');

        doc.fillColor('#38BDF8')
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .text(`${orderLabel} • ${title} (${digitsCount} DÍGITOS)`, margin + 8, currentY + 5);

        if (cand.state && cand.cargo !== 'PRESIDENTE') {
          doc.fillColor('#94A3B8')
            .font('Helvetica')
            .fontSize(7)
            .text(`UF: ${cand.state.toUpperCase()}`, margin + contentWidth - 70, currentY + 5, {
              align: 'right',
              width: 62,
            });
        }

        // ─── Foto Real ou Avatar com Iniciais ────────────────────────
        const photoY = currentY + cargoHeaderHeight + 4;
        const photoSize = cardHeight - cargoHeaderHeight - 8;
        const photoX = margin + 8;
        const photoData = candidateImages[i];

        if (photoData) {
          try {
            doc.image(photoData, photoX, photoY, {
              fit: [photoSize, photoSize],
              align: 'center',
              valign: 'center',
            });
            doc.rect(photoX, photoY, photoSize, photoSize).lineWidth(1).stroke('#CBD5E1');
          } catch {
            this.drawAvatarFallback(doc, cand.name, photoX, photoY, photoSize);
          }
        } else {
          this.drawAvatarFallback(doc, cand.name, photoX, photoY, photoSize);
        }

        // ─── Dados Textuais do Candidato ─────────────────────────────
        const textX = photoX + photoSize + 10;
        const digitsBoxReserve = 135;
        const maxTextWidth = contentWidth - photoSize - digitsBoxReserve - 20;

        // Nome do Candidato
        doc.fillColor('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(totalCandidates <= 5 ? 11 : 9.5)
          .text(cand.name, textX, photoY, { width: maxTextWidth, lineBreak: false });

        let infoY = photoY + (totalCandidates <= 5 ? 15 : 13);

        // Nome do Vice (se houver)
        if (cand.viceName && cardHeight >= 70) {
          doc.fillColor('#475569')
            .font('Helvetica')
            .fontSize(7)
            .text(`Vice: ${cand.viceName}`, textX, infoY, {
              width: maxTextWidth,
              lineBreak: false,
            });
          infoY += 10;
        }

        // Partido e Federação
        const partyLabel = cand.partyNumber ? `${cand.party} • ${cand.partyNumber}` : cand.party;
        doc.fillColor('#047857')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(partyLabel, textX, infoY, { width: maxTextWidth });
        infoY += 10;

        // Badge Ficha Limpa / TSE Deferido
        if (cardHeight >= 70) {
          doc.fillColor('#15803D')
            .font('Helvetica')
            .fontSize(6.8)
            .text('✓ Registro Deferido no TSE • Ficha Limpa', textX, infoY);
        }

        // ─── Caixa de Dígitos de Urna (Estilo Teclado Eletrônico) ────
        const digits = resolvedNumber.split('');
        const boxWidth = totalCandidates <= 5 ? 19 : 17;
        const boxHeight = totalCandidates <= 5 ? 24 : 21;
        const boxSpacing = 3;
        const totalDigitsWidth = digits.length * boxWidth + (digits.length - 1) * boxSpacing;
        const digitsStartX = margin + contentWidth - totalDigitsWidth - 10;
        const digitsStartY = currentY + cargoHeaderHeight + 11;

        // Rótulo "NÚMERO NA URNA"
        doc.fillColor('#64748B')
          .font('Helvetica-Bold')
          .fontSize(6.5)
          .text('NÚMERO NA URNA', digitsStartX - 10, currentY + cargoHeaderHeight + 2, {
            width: totalDigitsWidth + 20,
            align: 'center',
          });

        for (let d = 0; d < digits.length; d++) {
          const bx = digitsStartX + d * (boxWidth + boxSpacing);
          // Caixa do dígito
          doc.rect(bx, digitsStartY, boxWidth, boxHeight).fillAndStroke('#F8FAFC', '#0F172A');

          // Número
          doc.fillColor('#0F172A')
            .font('Helvetica-Bold')
            .fontSize(totalCandidates <= 5 ? 14 : 12)
            .text(digits[d], bx, digitsStartY + (totalCandidates <= 5 ? 4 : 3), {
              width: boxWidth,
              align: 'center',
            });
        }

        currentY += cardHeight + cardSpacing;
      }

      // ─────────────────────────────────────────────────────────────
      // 4. BLOCO DE AJUDA CÍVICA & FINANCIAMENTO COLETIVO INDEPENDENTE
      // ─────────────────────────────────────────────────────────────
      const civicBoxHeight = 58;
      const civicY = Math.max(currentY + 4, doc.page.height - margin - civicBoxHeight - 16);

      // Card de Fundo
      doc.rect(margin, civicY, contentWidth, civicBoxHeight).fillAndStroke(
        '#F0FDF4',
        '#86EFAC',
      );

      // Faixa lateral verde escura de destaque
      doc.rect(margin, civicY, 4, civicBoxHeight).fill('#16A34A');

      // QR Code PIX à esquerda
      const pixQrSize = 46;
      const pixQrX = margin + 10;
      const pixQrY = civicY + 6;

      if (pixQrBuffer) {
        try {
          doc.rect(pixQrX - 1, pixQrY - 1, pixQrSize + 2, pixQrSize + 2).fill('#FFFFFF');
          doc.image(pixQrBuffer, pixQrX, pixQrY, { fit: [pixQrSize, pixQrSize] });
        } catch {}
      }

      const civicTextX = pixQrX + pixQrSize + 12;
      const civicTextWidth = contentWidth - pixQrSize - 26;

      // Textos do Apoio Cívico
      doc.fillColor('#166534')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('🛡️ AJUDA CÍVICA • FINANCIAMENTO COLETIVO INDEPENDENTE', civicTextX, civicY + 6);

      doc.fillColor('#334155')
        .font('Helvetica')
        .fontSize(7)
        .text(
          'Plataforma mantida por voluntários, sem fundo partidário nem recursos públicos.',
          civicTextX,
          civicY + 18,
          { width: civicTextWidth },
        );

      doc.fillColor('#0F172A')
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .text(
          `Chave PIX Celular: ${PIX_KEY_CELULAR_DISPLAY} • Beneficiário: ${PIX_BENEFICIARY}`,
          civicTextX,
          civicY + 29,
          { width: civicTextWidth },
        );

      doc.fillColor('#475569')
        .font('Helvetica')
        .fontSize(6.5)
        .text(
          'Escaneie o QR Code ao lado ou use a chave celular acima no app do seu banco para apoiar a infraestrutura.',
          civicTextX,
          civicY + 41,
          { width: civicTextWidth },
        );

      // ─────────────────────────────────────────────────────────────
      // 5. RODAPÉ INSTITUCIONAL DISCRETO
      // ─────────────────────────────────────────────────────────────
      const footerY = doc.page.height - margin - 10;
      doc.fillColor('#94A3B8')
        .font('Helvetica')
        .fontSize(6)
        .text(
          'Eleições Progressistas • Dados Oficiais do TSE • Resolução nº 23.736/2024 • Não recolhemos nem armazenamos votos.',
          margin,
          footerY,
          { width: contentWidth, align: 'center' },
        );

      doc.end();
    });
  }

  /**
   * Desenha um avatar com as iniciais do candidato quando a foto não estiver no disco.
   */
  private drawAvatarFallback(doc: any, name: string, x: number, y: number, size: number) {
    const initials = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');

    doc.rect(x, y, size, size).fillAndStroke('#E0E7FF', '#6366F1');

    doc.fillColor('#4338CA')
      .font('Helvetica-Bold')
      .fontSize(size * 0.38)
      .text(initials || 'C', x, y + size * 0.28, { width: size, align: 'center' });
  }
}
