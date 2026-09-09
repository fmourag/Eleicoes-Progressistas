import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../common/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ReportOrderStatus } from '@prisma/client';

describe('ReportsService - B2B Relatórios & Telemetria Agregada', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrisma = {
    reportProduct: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'prod-1',
          slug: 'relatorio-prioridades-nacional',
          title: 'Relatório Nacional de Prioridades Cívicas 2026',
          category: 'PRIORIDADES',
          priceCents: 25000,
          publicSummary: 'Panorama de prioridades',
        },
      ]),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.slug === 'relatorio-prioridades-nacional' || where?.OR?.some((o: any) => o.slug === 'relatorio-prioridades-nacional' || o.id === 'prod-1')) {
          return Promise.resolve({
            id: 'prod-1',
            slug: 'relatorio-prioridades-nacional',
            title: 'Relatório Nacional de Prioridades Cívicas 2026',
            category: 'PRIORIDADES',
            priceCents: 25000,
            publicSummary: 'Panorama de prioridades',
          });
        }
        return Promise.resolve(null);
      }),
    },
    reportOrder: {
      create: jest.fn().mockImplementation(({ data }) => ({
        id: 'order-1',
        productId: data.productId,
        buyerOrg: data.buyerOrg,
        buyerEmail: data.buyerEmail,
        status: ReportOrderStatus.SOLICITADO,
        createdAt: new Date(),
        product: {
          id: data.productId,
          slug: 'relatorio-prioridades-nacional',
          title: 'Relatório Nacional de Prioridades Cívicas 2026',
          category: 'PRIORIDADES',
          priceCents: 25000,
        },
      })),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where?.id === 'order-1') {
          return Promise.resolve({
            id: 'order-1',
            productId: 'prod-1',
            buyerOrg: 'Instituto Democracia Digital',
            buyerEmail: 'contato@democracia.org.br',
            status: ReportOrderStatus.PAGO,
            paymentRef: 'PIX-12345-CONFIRMED',
            deliveredAt: null,
            createdAt: new Date(),
            product: {
              id: 'prod-1',
              slug: 'relatorio-prioridades-nacional',
              title: 'Relatório Nacional de Prioridades Cívicas 2026',
              category: 'PRIORIDADES',
              priceCents: 25000,
              publicSummary: 'Panorama de prioridades',
            },
          });
        }
        if (where?.id === 'order-unpaid') {
          return Promise.resolve({
            id: 'order-unpaid',
            productId: 'prod-1',
            buyerOrg: 'ONG Transparência',
            buyerEmail: 'contato@ong.org.br',
            status: ReportOrderStatus.SOLICITADO,
            paymentRef: null,
            deliveredAt: null,
            createdAt: new Date(),
            product: {
              id: 'prod-1',
              slug: 'relatorio-prioridades-nacional',
              title: 'Relatório Nacional de Prioridades Cívicas 2026',
              category: 'PRIORIDADES',
              priceCents: 25000,
              publicSummary: 'Panorama de prioridades',
            },
          });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => ({
        id: where.id,
        status: data.status,
        paymentRef: data.paymentRef,
        deliveredAt: data.deliveredAt,
      })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    aggregateCounter: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'ac-1', key: 'rank:p3:SP:2026-09-08', count: 42 },
        { id: 'ac-2', key: 'rank:p1:SP:2026-09-08', count: 38 },
        { id: 'ac-3', key: 'rank:total:SP:2026-09-08', count: 80 },
      ]),
    },
    candidate: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'c1', name: 'Cand 1', party: 'PT', cargo: 'DEPUTADO_FEDERAL', overallCommitmentScore: 92 },
        { id: 'c2', name: 'Cand 2', party: 'PSOL', cargo: 'DEPUTADO_FEDERAL', overallCommitmentScore: 95 },
      ]),
    },
    pledge: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'pl-1', status: 'CUMPRIDA', pillar: 'p3' },
        { id: 'pl-2', status: 'EM_ANDAMENTO', pillar: 'p1' },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. getCatalog - should return available B2B reports', async () => {
    const catalog = await service.getCatalog();
    expect(catalog).toHaveLength(1);
    expect(catalog[0].slug).toBe('relatorio-prioridades-nacional');
  });

  it('2. createOrder - should create order with SOLICITADO status and return PIX details', async () => {
    const result = await service.createOrder({
      productSlug: 'relatorio-prioridades-nacional',
      buyerOrg: 'Instituto Democracia Digital',
      buyerEmail: 'contato@democracia.org.br',
    });

    expect(result.orderId).toBe('order-1');
    expect(result.status).toBe(ReportOrderStatus.SOLICITADO);
    expect(result.paymentInstructions.method).toBe('PIX_MANUAL');
    expect(result.paymentInstructions.amountFormatted).toBe('R$ 250,00');
    expect(result.product.title).toBe('Relatório Nacional de Prioridades Cívicas 2026');
  });

  it('3. adminConfirmPayment - should mark order as PAGO and save paymentRef', async () => {
    const updated = await service.adminConfirmPayment('order-1', 'PIX-E2E-REF-999');
    expect(updated.status).toBe(ReportOrderStatus.PAGO);
    expect(updated.paymentRef).toBe('PIX-E2E-REF-999');
  });

  it('4. adminDeliverOrder - should mark order as ENTREGUE with deliveredAt timestamp', async () => {
    const delivered = await service.adminDeliverOrder('order-1');
    expect(delivered.status).toBe(ReportOrderStatus.ENTREGUE);
    expect(delivered.deliveredAt).toBeDefined();
  });

  it('5. getReportData - should block unpaid orders with 403 Forbidden', async () => {
    await expect(service.getReportData('order-unpaid')).rejects.toThrow(HttpException);
  });

  it('6. getReportData - should calculate aggregated metrics without user identifiers', async () => {
    const report = await service.getReportData('order-1');
    expect(report.category).toBe('PRIORIDADES');
    expect(report.data.totalConsultas).toBe(80);
    expect(report.data.demandasPorPilar['p3']).toBe(42);
    expect(report.data.demandasPorPilar['p1']).toBe(38);
    expect(report.data.distribuicaoRegional['SP']).toBe(80);

    // Garantia estrita: nenhuma chave de usuário/dispositivo
    expect(report.data).not.toHaveProperty('deviceHash');
    expect(report.data).not.toHaveProperty('ip');
    expect(report.data).not.toHaveProperty('session');
  });

  it('7. exportCsv - should format aggregated report as valid CSV', async () => {
    const csv = await service.exportCsv('order-1');
    expect(csv).toContain('"RELATORIO B2B - ELEICOES PROGRESSISTAS v2.2.0"');
    expect(csv).toContain('"p3";42');
    expect(csv).toContain('"SP";80');
  });

  it('8. exportPdf - should generate binary PDF buffer with PDFKit header', async () => {
    const buffer = await service.exportPdf('order-1');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);
    // Valida magic bytes do PDF: "%PDF"
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF');
  });
});
