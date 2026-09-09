import { Injectable, HttpException, HttpStatus, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ReportOrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import PDFDocument from 'pdfkit';

export interface ReportPayload {
  reportTitle: string;
  category: string;
  generatedAt: string;
  buyerOrg: string;
  summary: string;
  data: Record<string, any>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Catálogo Público de Relatórios B2B
  // ─────────────────────────────────────────────────────────────

  async getCatalog() {
    return this.prisma.reportProduct.findMany({
      orderBy: { priceCents: 'asc' },
    });
  }

  async getProduct(slugOrId: string) {
    const product = await this.prisma.reportProduct.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });

    if (!product) {
      throw new HttpException('Relatório não encontrado no catálogo.', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  // ─────────────────────────────────────────────────────────────
  // Pedidos e Pagamento PIX Manual (Hospedagem Fiscal / Conciliação)
  // ─────────────────────────────────────────────────────────────

  async createOrder(dto: CreateOrderDto) {
    const product = await this.prisma.reportProduct.findFirst({
      where: {
        OR: [
          ...(dto.productId ? [{ id: dto.productId }] : []),
          ...(dto.productSlug ? [{ slug: dto.productSlug }] : []),
        ],
      },
    });

    if (!product) {
      throw new HttpException('Produto de relatório inválido ou não informado.', HttpStatus.BAD_REQUEST);
    }

    const order = await this.prisma.reportOrder.create({
      data: {
        productId: product.id,
        buyerOrg: dto.buyerOrg.trim(),
        buyerEmail: dto.buyerEmail.trim().toLowerCase(),
        status: ReportOrderStatus.SOLICITADO,
      },
      include: {
        product: true,
      },
    });

    const pixKey = process.env.PIX_KEY || 'financeiro@eleicoesprogressistas.org.br';
    const priceFormatted = `R$ ${(product.priceCents / 100).toFixed(2).replace('.', ',')}`;

    return {
      orderId: order.id,
      status: order.status,
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        category: product.category,
        priceCents: product.priceCents,
        priceFormatted,
      },
      buyer: {
        buyerOrg: order.buyerOrg,
        buyerEmail: order.buyerEmail,
      },
      paymentInstructions: {
        method: 'PIX_MANUAL',
        pixKey,
        beneficiary: 'Eleições Progressistas - Plataforma Cívica B2B',
        amountFormatted: priceFormatted,
        description: `Pedido ${order.id.slice(0, 8)}`,
        note: 'Efetue a transferência PIX e envie o comprovante informando o ID do pedido. A liberação do download ocorre após a conciliação manual sem taxas de intermediários.',
      },
      createdAt: order.createdAt,
    };
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.reportOrder.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new HttpException('Pedido não encontrado.', HttpStatus.NOT_FOUND);
    }

    return {
      id: order.id,
      status: order.status,
      buyerOrg: order.buyerOrg,
      buyerEmail: order.buyerEmail,
      paymentRef: order.paymentRef,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      product: {
        id: order.product.id,
        slug: order.product.slug,
        title: order.product.title,
        category: order.product.category,
        priceCents: order.product.priceCents,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Endpoints Administrativos (AdminGuard)
  // ─────────────────────────────────────────────────────────────

  async adminConfirmPayment(orderId: string, paymentRef: string) {
    const order = await this.prisma.reportOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new HttpException('Pedido não encontrado.', HttpStatus.NOT_FOUND);
    }

    return this.prisma.reportOrder.update({
      where: { id: orderId },
      data: {
        status: ReportOrderStatus.PAGO,
        paymentRef: paymentRef.trim(),
      },
      include: { product: true },
    });
  }

  async adminDeliverOrder(orderId: string) {
    const order = await this.prisma.reportOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new HttpException('Pedido não encontrado.', HttpStatus.NOT_FOUND);
    }

    return this.prisma.reportOrder.update({
      where: { id: orderId },
      data: {
        status: ReportOrderStatus.ENTREGUE,
        deliveredAt: new Date(),
      },
      include: { product: true },
    });
  }

  async adminListOrders() {
    return this.prisma.reportOrder.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Geração de Dados e Entrega em JSON, CSV e PDF
  // ─────────────────────────────────────────────────────────────

  async getReportData(orderId: string): Promise<ReportPayload> {
    const order = await this.prisma.reportOrder.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new HttpException('Pedido não encontrado.', HttpStatus.NOT_FOUND);
    }

    if (order.status !== ReportOrderStatus.PAGO && order.status !== ReportOrderStatus.ENTREGUE) {
      throw new HttpException(
        `O pedido está com status ${order.status}. O relatório só é liberado após a confirmação do pagamento PIX.`,
        HttpStatus.FORBIDDEN,
      );
    }

    const category = order.product.category;
    let data: Record<string, any> = {};

    if (category === 'PRIORIDADES') {
      // Agrega contadores estritamente anônimos da tabela AggregateCounter
      const counters = await this.prisma.aggregateCounter.findMany();
      const byPillar: Record<string, number> = {};
      const byUf: Record<string, number> = {};
      let totalConsultas = 0;

      for (const c of counters) {
        const parts = c.key.split(':'); // rank:<pillar|total>:<uf>:<date>
        if (parts.length >= 4 && parts[0] === 'rank') {
          const item = parts[1];
          const uf = parts[2];
          if (item === 'total') {
            totalConsultas += c.count;
            byUf[uf] = (byUf[uf] || 0) + c.count;
          } else {
            byPillar[item] = (byPillar[item] || 0) + c.count;
          }
        }
      }

      data = {
        totalConsultas,
        demandasPorPilar: byPillar,
        distribuicaoRegional: byUf,
        contadoresTotais: counters.length,
      };
    } else if (category === 'COMPROMETIMENTO') {
      const candidates = await this.prisma.candidate.findMany({
        select: {
          id: true,
          name: true,
          party: true,
          cargo: true,
          state: true,
          profileScores: true,
          fichaLimpa: true,
        },
      });

      const partyScores: Record<string, { sum: number; count: number }> = {};
      for (const c of candidates) {
        let score = 70;
        if (c.profileScores && typeof c.profileScores === 'object') {
          const vals = Object.values(c.profileScores as Record<string, number>).filter((v) => typeof v === 'number');
          if (vals.length > 0) {
            score = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
          }
        }
        if (!partyScores[c.party]) {
          partyScores[c.party] = { sum: 0, count: 0 };
        }
        partyScores[c.party].sum += score;
        partyScores[c.party].count += 1;
      }

      const mediaPorPartido = Object.entries(partyScores).map(([party, stat]) => ({
        partido: party,
        mediaComprometimento: Math.round((stat.sum / stat.count) * 10) / 10,
        candidatosAvaliados: stat.count,
      }));

      data = {
        totalCandidatosAvaliados: candidates.length,
        mediaPorPartido,
      };
    } else if (category === 'PROMESSAS') {
      const pledges = await this.prisma.pledge.findMany({
        include: { candidate: { select: { name: true, party: true } } },
      });

      const porStatus: Record<string, number> = {};
      const porPilar: Record<string, number> = {};
      for (const p of pledges) {
        porStatus[p.status] = (porStatus[p.status] || 0) + 1;
        porPilar[p.pillar] = (porPilar[p.pillar] || 0) + 1;
      }

      data = {
        totalPromessas: pledges.length,
        distribuicaoStatus: porStatus,
        distribuicaoPilar: porPilar,
      };
    } else {
      // FINANCIAMENTO ou GERAL
      data = {
        resumo: 'Relatório estruturado de integridade e transparência eleitoral.',
        indicadores: {
          coletaZeroGarantida: true,
          telemetriaAnonima: true,
        },
      };
    }

    return {
      reportTitle: order.product.title,
      category: order.product.category,
      generatedAt: new Date().toISOString(),
      buyerOrg: order.buyerOrg,
      summary: order.product.publicSummary,
      data,
    };
  }

  async exportCsv(orderId: string): Promise<string> {
    const report = await this.getReportData(orderId);
    const lines: string[] = [];

    lines.push(`"RELATORIO B2B - ELEICOES PROGRESSISTAS v2.2.0"`);
    lines.push(`"Titulo";"${report.reportTitle}"`);
    lines.push(`"Categoria";"${report.category}"`);
    lines.push(`"Organizacao Compradora";"${report.buyerOrg}"`);
    lines.push(`"Data de Geracao";"${report.generatedAt}"`);
    lines.push(``);

    if (report.category === 'PRIORIDADES') {
      lines.push(`"Pilar";"Consultas Agregadas"`);
      const pilares = report.data.demandasPorPilar || {};
      for (const [p, count] of Object.entries(pilares)) {
        lines.push(`"${p}";${count}`);
      }
      lines.push(``);
      lines.push(`"UF";"Total Consultas"`);
      const ufs = report.data.distribuicaoRegional || {};
      for (const [uf, count] of Object.entries(ufs)) {
        lines.push(`"${uf}";${count}`);
      }
    } else if (report.category === 'COMPROMETIMENTO') {
      lines.push(`"Partido";"Media de Comprometimento (%)";"Candidatos Avaliados"`);
      const medias = report.data.mediaPorPartido || [];
      for (const m of medias) {
        lines.push(`"${m.partido}";${m.mediaComprometimento};${m.candidatosAvaliados}`);
      }
    } else if (report.category === 'PROMESSAS') {
      lines.push(`"Status";"Quantidade de Promessas"`);
      const st = report.data.distribuicaoStatus || {};
      for (const [s, c] of Object.entries(st)) {
        lines.push(`"${s}";${c}`);
      }
    } else {
      lines.push(`"Chave";"Valor"`);
      for (const [k, v] of Object.entries(report.data)) {
        lines.push(`"${k}";"${typeof v === 'object' ? JSON.stringify(v) : v}"`);
      }
    }

    return lines.join('\n');
  }

  async exportPdf(orderId: string): Promise<Buffer> {
    const report = await this.getReportData(orderId);

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho Institucional
      doc.rect(40, 40, 515, 60).fill('#0F172A');
      doc.fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('ELEIÇÕES PROGRESSISTAS — RELATÓRIO B2B', 55, 52);

      doc.fillColor('#94A3B8')
        .font('Helvetica')
        .fontSize(9)
        .text('Inteligência de Dados Cívicos • Coleta Zero • Prejuízo Zero', 55, 74);

      // Metadados
      let y = 120;
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(14).text(report.reportTitle, 40, y);
      y += 24;

      doc.fillColor('#475569')
        .font('Helvetica')
        .fontSize(10)
        .text(`Organização Adquirente: ${report.buyerOrg}`, 40, y);
      y += 16;
      doc.text(`Categoria: ${report.category}  |  Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`, 40, y);
      y += 24;

      // Resumo Público
      doc.rect(40, y, 515, 48).fillAndStroke('#F8FAFC', '#CBD5E1');
      doc.fillColor('#334155')
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(report.summary, 50, y + 10, { width: 495 });
      y += 64;

      // Seção de Dados
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(12).text('Indicadores e Telemetria Agregada:', 40, y);
      y += 20;

      if (report.category === 'PRIORIDADES') {
        const pilares = report.data.demandasPorPilar || {};
        doc.font('Helvetica').fontSize(9).fillColor('#1E293B');
        for (const [pilar, count] of Object.entries(pilares)) {
          doc.text(`• Pilar [${pilar.toUpperCase()}]: ${count} consultas prioritárias registradas`, 50, y);
          y += 16;
        }
        y += 10;
        doc.font('Helvetica-Bold').text(`Total Geral de Consultas Avaliadas: ${report.data.totalConsultas || 0}`, 50, y);
        y += 24;
      } else if (report.category === 'COMPROMETIMENTO') {
        const medias = report.data.mediaPorPartido || [];
        doc.font('Helvetica').fontSize(9).fillColor('#1E293B');
        for (const m of medias) {
          doc.text(`• Partido ${m.partido}: ${m.mediaComprometimento}% de aderência média (${m.candidatosAvaliados} candidaturas)`, 50, y);
          y += 16;
        }
        y += 24;
      } else if (report.category === 'PROMESSAS') {
        const st = report.data.distribuicaoStatus || {};
        doc.font('Helvetica').fontSize(9).fillColor('#1E293B');
        for (const [status, count] of Object.entries(st)) {
          doc.text(`• Status [${status}]: ${count} promessas cadastradas`, 50, y);
          y += 16;
        }
        y += 24;
      }

      // Rodapé de Conformidade
      const footerY = doc.page.height - 70;
      doc.rect(40, footerY, 515, 30).fill('#F1F5F9');
      doc.fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text(
          'Garantia Legal: Dados estritamente agregados via contadores anônimos. Nenhum dado pessoal ou de dispositivo de eleitores é coletado ou comercializado.',
          48,
          footerY + 8,
          { width: 500, align: 'center' }
        );

      doc.end();
    });
  }
}
