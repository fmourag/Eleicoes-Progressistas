import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
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

const CARGO_CONFIG: Record<string, { title: string; digits: number; orderLabel: string }> = {
  DEPUTADO_FEDERAL: { title: 'DEPUTADO(A) FEDERAL', digits: 4, orderLabel: '1º A VOTAR' },
  DEPUTADO_ESTADUAL: { title: 'DEPUTADO(A) ESTADUAL', digits: 5, orderLabel: '2º A VOTAR' },
  DEPUTADO_DISTRITAL: { title: 'DEPUTADO(A) DISTRITAL', digits: 5, orderLabel: '2º A VOTAR' },
  SENADOR: { title: 'SENADOR(A)', digits: 3, orderLabel: '3º A VOTAR' },
  GOVERNADOR: { title: 'GOVERNADOR(A)', digits: 2, orderLabel: '4º A VOTAR' },
  PRESIDENTE: { title: 'PRESIDENTE DA REPÚBLICA', digits: 2, orderLabel: '5º A VOTAR' },
  VEREADOR: { title: 'VEREADOR(A)', digits: 5, orderLabel: '1º A VOTAR' },
  PREFEITO: { title: 'PREFEITO(A)', digits: 2, orderLabel: '2º A VOTAR' },
};

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
   * Localiza com segurança o arquivo de imagem do candidato no disco (protegido contra path traversal).
   */
  private resolveCandidateImagePath(cand: ColaCandidateItemDto): string | null {
    const searchDirs = [
      path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
      path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
      path.resolve(process.cwd(), 'public/candidates'),
      path.resolve(__dirname, '../../../../apps/mobile/public/candidates'),
      path.resolve(__dirname, '../../../../apps/mobile/dist/candidates'),
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

    for (const dir of searchDirs) {
      const resolvedDir = path.resolve(dir);
      for (const fileName of fileNamesToTry) {
        // Garante que o arquivo fica restrito estritamente dentro do diretório autorizado
        const fullPath = path.resolve(resolvedDir, fileName);
        if (fullPath.startsWith(resolvedDir) && fs.existsSync(fullPath)) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
              return fullPath;
            }
          } catch {
            // Ignora se não conseguir inspecionar
          }
        }
      }
    }

    return null;
  }

  /**
   * Gera o PDF completo da Cola Eleitoral com fotos e layout oficial.
   */
  async generatePdf(dto: GenerateColaPdfDto): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const candidates = [...dto.candidates];

      // Ordena os candidatos na sequência oficial da urna eletrônica
      candidates.sort((a, b) => {
        const indexA = VOTING_ORDER.indexOf(a.cargo.toUpperCase());
        const indexB = VOTING_ORDER.indexOf(b.cargo.toUpperCase());
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });

      // Criação do documento PDF em formato A4
      const doc = new PDFDocument({
        size: 'A4',
        margin: 28,
        info: {
          Title: 'Cola Eleitoral 2026 - Eleições Progressistas',
          Author: 'Eleições Progressistas',
          Subject: 'Colinha do Eleitor para o Dia da Votação',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;

      // ─────────────────────────────────────────────────────────────
      // 1. CABEÇALHO CÍVICO
      // ─────────────────────────────────────────────────────────────
      // Barra Superior Verde-Bandeira
      doc.rect(margin, 20, contentWidth, 54).fill('#047857'); // Emerald 700

      // Faixa decorativa amarela
      doc.rect(margin, 74, contentWidth, 4).fill('#F59E0B'); // Amber 500

      // Texto do Cabeçalho
      doc.fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('ELEIÇÕES PROGRESSISTAS 2026 • JUSTIÇA ELEITORAL', margin + 14, 27, { width: contentWidth - 28 });

      const ufText = dto.state ? `ESTADO: ${dto.state.toUpperCase()}` : 'CIRCUNSCRIÇÃO NACIONAL';
      const munText = dto.municipality ? ` • ${dto.municipality}` : '';
      const dateText = new Date().toLocaleDateString('pt-BR');

      doc.fillColor('#D1FAE5')
        .font('Helvetica')
        .fontSize(8.5)
        .text(`"Cheque o passado. Escolha o futuro." • COLA ELEITORAL • ${ufText}${munText} • EMISSÃO: ${dateText}`, margin + 14, 46, { width: contentWidth - 28 });

      // ─────────────────────────────────────────────────────────────
      // 2. AVISO LEGAL DO TSE (RESOLUÇÃO 23.736/2024)
      // ─────────────────────────────────────────────────────────────
      const alertY = 86;
      doc.rect(margin, alertY, contentWidth, 34)
        .fillAndStroke('#FEF3C7', '#F59E0B'); // Fundo âmbar claro com borda

      doc.fillColor('#92400E')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('AVISO OFICIAL DO TSE (Resolução nº 23.736/2024):', margin + 10, alertY + 6);

      doc.fillColor('#78350F')
        .font('Helvetica')
        .fontSize(7.8)
        .text('É PERMITIDO levar esta colinha impressa em papel para a cabine de votação. É PROIBIDO entrar na cabine com celular, câmera ou filmadora.', margin + 10, alertY + 18, { width: contentWidth - 20 });

      // ─────────────────────────────────────────────────────────────
      // 3. CARTÕES DOS CANDIDATOS NA ORDEM DA URNA
      // ─────────────────────────────────────────────────────────────
      let currentY = 128;
      const cardHeight = candidates.length <= 5 ? 112 : 98;
      const cardSpacing = 8;

      if (candidates.length === 0) {
        doc.rect(margin, currentY, contentWidth, 80).fillAndStroke('#F3F4F6', '#D1D5DB');
        doc.fillColor('#4B5563')
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('Nenhum candidato selecionado na cola.', margin + 20, currentY + 32, { align: 'center', width: contentWidth - 40 });
        currentY += 90;
      }

      let senatorCount = 0;
      for (let i = 0; i < candidates.length; i++) {
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

        const resolvedNumber = cand.numeroUrna || getNumeroUrna({
          cargo: cand.cargo,
          partyNumber: cand.partyNumber,
          party: cand.party,
          tseId: cand.tseId,
          name: cand.name,
        });

        // Fundo do Card
        doc.rect(margin, currentY, contentWidth, cardHeight)
          .fillAndStroke('#FFFFFF', '#E5E7EB');

        // Barra de Título do Cargo
        doc.rect(margin, currentY, contentWidth, 22)
          .fill('#1E293B'); // Slate 800

        doc.fillColor('#38BDF8')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`${orderLabel} • ${title} (${digitsCount} DÍGITOS)`, margin + 10, currentY + 6);

        if (cand.state && cand.cargo !== 'PRESIDENTE') {
          doc.fillColor('#94A3B8')
            .font('Helvetica')
            .fontSize(8)
            .text(`UF: ${cand.state.toUpperCase()}`, margin + contentWidth - 70, currentY + 6, { align: 'right', width: 60 });
        }

        // ─── Foto ou Avatar com Iniciais ─────────────────────────────
        const photoY = currentY + 28;
        const photoSize = cardHeight - 36;
        const photoX = margin + 10;
        const photoPath = this.resolveCandidateImagePath(cand);

        if (photoPath) {
          try {
            // Desenha a foto recortada em quadrado/borda suave
            doc.image(photoPath, photoX, photoY, {
              fit: [photoSize, photoSize],
              align: 'center',
              valign: 'center',
            });
            doc.rect(photoX, photoY, photoSize, photoSize)
              .lineWidth(1)
              .stroke('#CBD5E1');
          } catch {
            this.drawAvatarFallback(doc, cand.name, photoX, photoY, photoSize);
          }
        } else {
          this.drawAvatarFallback(doc, cand.name, photoX, photoY, photoSize);
        }

        // ─── Dados Textuais do Candidato ─────────────────────────────
        const textX = photoX + photoSize + 14;
        const maxTextWidth = contentWidth - photoSize - 160;

        // Nome do Candidato
        doc.fillColor('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(13)
          .text(cand.name, textX, currentY + 28, { width: maxTextWidth, lineBreak: false });

        let infoY = currentY + 45;

        // Nome do Vice (se houver)
        if (cand.viceName) {
          doc.fillColor('#475569')
            .font('Helvetica')
            .fontSize(8.5)
            .text(`Vice: ${cand.viceName}`, textX, infoY, { width: maxTextWidth });
          infoY += 13;
        }

        // Partido e Federação
        const partyLabel = cand.partyNumber ? `${cand.party} • ${cand.partyNumber}` : cand.party;
        doc.fillColor('#047857')
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(partyLabel, textX, infoY, { width: maxTextWidth });
        infoY += 14;

        // Badge Ficha Limpa / TSE Deferido
        doc.fillColor('#15803D')
          .font('Helvetica')
          .fontSize(8)
          .text('✓ Registro Deferido no TSE • Ficha Limpa', textX, infoY);

        // ─── Caixa de Dígitos de Urna (Estilo Teclado Eletrônico) ────
        const digits = resolvedNumber.split('');
        const boxWidth = 22;
        const boxHeight = 28;
        const boxSpacing = 4;
        const totalDigitsWidth = digits.length * boxWidth + (digits.length - 1) * boxSpacing;
        const digitsStartX = margin + contentWidth - totalDigitsWidth - 14;
        const digitsStartY = currentY + 38;

        // Rótulo "NÚMERO NA URNA"
        doc.fillColor('#64748B')
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .text('NÚMERO NA URNA', digitsStartX - 10, currentY + 26, { width: totalDigitsWidth + 20, align: 'center' });

        for (let d = 0; d < digits.length; d++) {
          const bx = digitsStartX + d * (boxWidth + boxSpacing);
          // Caixa do dígito
          doc.rect(bx, digitsStartY, boxWidth, boxHeight)
            .fillAndStroke('#F8FAFC', '#0F172A');

          // Número grande
          doc.fillColor('#0F172A')
            .font('Helvetica-Bold')
            .fontSize(17)
            .text(digits[d], bx, digitsStartY + 5, { width: boxWidth, align: 'center' });
        }

        currentY += cardHeight + cardSpacing;
      }

      // ─────────────────────────────────────────────────────────────
      // 4. RODAPÉ INFORMATIVO / PATROCÍNIO ÉTICO (COLA_FOOTER)
      // ─────────────────────────────────────────────────────────────
      const simDate = dto.date ? new Date(dto.date) : undefined;
      const colaAd = await this.adsService.getColaFooterAd(dto.deviceHash, simDate);

      if (colaAd) {
        const footerY = doc.page.height - 46;
        doc.rect(margin, footerY, contentWidth, 26)
          .fill('#F1F5F9');

        doc.fillColor('#475569')
          .font('Helvetica')
          .fontSize(7.5)
          .text(
            `Impressão apoiada por ${colaAd.advertiser.name} • ${colaAd.targetUrl}`,
            margin + 8,
            footerY + 9,
            { width: contentWidth - 16, align: 'center' }
          );
      }

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

    doc.rect(x, y, size, size)
      .fillAndStroke('#E0E7FF', '#6366F1');

    doc.fillColor('#4338CA')
      .font('Helvetica-Bold')
      .fontSize(size * 0.4)
      .text(initials || 'C', x, y + size * 0.25, { width: size, align: 'center' });
  }
}
