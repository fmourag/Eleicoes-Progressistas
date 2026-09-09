import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AdminGuard } from '../auth/admin.guard';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { ReportOrderStatus } from '@prisma/client';
import { Response } from 'express';

describe('ReportsController - /api/reports', () => {
  let controller: ReportsController;

  const mockReportsService = {
    getCatalog: jest.fn().mockResolvedValue([
      {
        id: 'prod-1',
        slug: 'relatorio-prioridades-nacional',
        title: 'Relatório Nacional de Prioridades Cívicas 2026',
        category: 'PRIORIDADES',
        priceCents: 25000,
      },
    ]),
    getProduct: jest.fn().mockResolvedValue({
      id: 'prod-1',
      slug: 'relatorio-prioridades-nacional',
      title: 'Relatório Nacional de Prioridades Cívicas 2026',
      category: 'PRIORIDADES',
      priceCents: 25000,
    }),
    createOrder: jest.fn().mockImplementation((dto: CreateOrderDto) => ({
      orderId: 'order-1',
      status: ReportOrderStatus.SOLICITADO,
      product: {
        id: 'prod-1',
        slug: dto.productSlug || 'relatorio-prioridades-nacional',
        priceCents: 25000,
      },
      paymentInstructions: {
        method: 'PIX_MANUAL',
        pixKey: 'financeiro@eleicoesprogressistas.org.br',
      },
    })),
    getOrder: jest.fn().mockResolvedValue({
      id: 'order-1',
      status: ReportOrderStatus.SOLICITADO,
      buyerOrg: 'Instituto Cívico',
      buyerEmail: 'contato@civico.org.br',
    }),
    adminListOrders: jest.fn().mockResolvedValue([
      { id: 'order-1', status: ReportOrderStatus.SOLICITADO },
    ]),
    adminConfirmPayment: jest.fn().mockImplementation((id: string, ref: string) => ({
      id,
      status: ReportOrderStatus.PAGO,
      paymentRef: ref,
    })),
    adminDeliverOrder: jest.fn().mockImplementation((id: string) => ({
      id,
      status: ReportOrderStatus.ENTREGUE,
      deliveredAt: new Date(),
    })),
    getReportData: jest.fn().mockResolvedValue({
      reportTitle: 'Relatório Nacional de Prioridades Cívicas 2026',
      category: 'PRIORIDADES',
      buyerOrg: 'Instituto Cívico',
      data: { totalConsultas: 100 },
    }),
    exportCsv: jest.fn().mockResolvedValue('"Titulo";"Relatorio"\n"Total";100'),
    exportPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock pdf content')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /products - should return list of products', async () => {
    const result = await controller.getCatalog();
    expect(result).toHaveLength(1);
    expect(mockReportsService.getCatalog).toHaveBeenCalled();
  });

  it('GET /products/:slug - should return product details', async () => {
    const result = await controller.getProduct('relatorio-prioridades-nacional');
    expect(result.slug).toBe('relatorio-prioridades-nacional');
    expect(mockReportsService.getProduct).toHaveBeenCalledWith('relatorio-prioridades-nacional');
  });

  it('POST /orders - should create order and return payment details', async () => {
    const dto: CreateOrderDto = {
      productSlug: 'relatorio-prioridades-nacional',
      buyerOrg: 'Instituto Cívico',
      buyerEmail: 'contato@civico.org.br',
    };
    const result = await controller.createOrder(dto);
    expect(result.orderId).toBe('order-1');
    expect(result.status).toBe(ReportOrderStatus.SOLICITADO);
    expect(mockReportsService.createOrder).toHaveBeenCalledWith(dto);
  });

  it('GET /orders/:id - should return order status', async () => {
    const result = await controller.getOrder('order-1');
    expect(result.id).toBe('order-1');
    expect(mockReportsService.getOrder).toHaveBeenCalledWith('order-1');
  });

  it('GET /download/:orderId?format=json - should return json data', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((d) => d),
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    const result = await controller.downloadReport('order-1', 'json', mockRes);
    expect(mockReportsService.getReportData).toHaveBeenCalledWith('order-1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('GET /download/:orderId?format=csv - should stream csv file', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn().mockImplementation((d) => d),
    } as unknown as Response;

    await controller.downloadReport('order-1', 'csv', mockRes);
    expect(mockReportsService.exportCsv).toHaveBeenCalledWith('order-1');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(mockRes.send).toHaveBeenCalled();
  });

  it('GET /download/:orderId?format=pdf - should stream pdf buffer', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn().mockImplementation((d) => d),
    } as unknown as Response;

    await controller.downloadReport('order-1', 'pdf', mockRes);
    expect(mockReportsService.exportPdf).toHaveBeenCalledWith('order-1');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockRes.send).toHaveBeenCalled();
  });

  it('ADMIN: PATCH /admin/orders/:id/confirm - should confirm payment', async () => {
    const dto: ConfirmOrderDto = { paymentRef: 'PIX-CONFIRMED-123' };
    const result = await controller.adminConfirmPayment('order-1', dto);
    expect(result.status).toBe(ReportOrderStatus.PAGO);
    expect(mockReportsService.adminConfirmPayment).toHaveBeenCalledWith('order-1', 'PIX-CONFIRMED-123');
  });

  it('ADMIN: PATCH /admin/orders/:id/deliver - should mark delivered', async () => {
    const result = await controller.adminDeliverOrder('order-1');
    expect(result.status).toBe(ReportOrderStatus.ENTREGUE);
    expect(mockReportsService.adminDeliverOrder).toHaveBeenCalledWith('order-1');
  });
});
