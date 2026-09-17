import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Response } from 'express';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: any;

  const mockFeedbackService = {
    create: jest.fn().mockResolvedValue({
      id: 1,
      protocol: 'FB-1710000000-abcd',
      reviewCta: {
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.eleicoesprogressistas.app',
        testingTrackUrl: 'https://play.google.com/apps/testing/com.eleicoesprogressistas.app',
        supportEmail: 'fmourag@gmail.com',
      },
    }),
    getDashboard: jest.fn().mockResolvedValue({
      total: 10,
      avgNps: 9.5,
      porProblema: { nenhum: 10 },
      ultimos: [],
    }),
    getExportCsv: jest.fn().mockResolvedValue('\uFEFFid;protocol;testerName\n1;FB-1;"Auditor"'),
  };

  beforeEach(async () => {
    process.env.ADMIN_SECRET = 'test-secret-key-123';
    process.env.ADMIN_FEEDBACK_TOKEN = 'feedback-token-456';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
    jest.clearAllMocks();
  });

  it('deve ser instanciado com sucesso', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /feedback)', () => {
    it('deve delegar a criação ao FeedbackService e retornar id e protocol', async () => {
      const dto: CreateFeedbackDto = {
        device: 'Google Pixel 7',
        nps: 10,
        problema: 'nenhum',
      };

      const res = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual({
        id: 1,
        protocol: 'FB-1710000000-abcd',
        reviewCta: {
          playStoreUrl: 'https://play.google.com/store/apps/details?id=com.eleicoesprogressistas.app',
          testingTrackUrl: 'https://play.google.com/apps/testing/com.eleicoesprogressistas.app',
          supportEmail: 'fmourag@gmail.com',
        },
      });
    });
  });

  describe('getDashboard (GET /feedback/dashboard)', () => {
    it('deve rejeitar requisição sem token com 401 Unauthorized', async () => {
      await expect(controller.getDashboard(undefined, undefined, undefined, undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve rejeitar requisição com token incorreto com 401 Unauthorized', async () => {
      await expect(
        controller.getDashboard('wrong-token', undefined, undefined, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve aceitar requisição com token válido via header x-admin-token', async () => {
      const result = await controller.getDashboard('test-secret-key-123', undefined, undefined, undefined);

      expect(service.getDashboard).toHaveBeenCalled();
      expect(result).toHaveProperty('total', 10);
      expect(result).toHaveProperty('avgNps', 9.5);
    });

    it('deve aceitar requisição com token válido via query param token', async () => {
      const result = await controller.getDashboard(undefined, undefined, 'feedback-token-456', undefined);

      expect(service.getDashboard).toHaveBeenCalled();
      expect(result).toHaveProperty('total', 10);
    });
  });

  describe('exportCsv (GET /feedback/export.csv)', () => {
    it('deve rejeitar exportação sem token com 401 Unauthorized', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.exportCsv(mockRes, undefined, undefined, undefined, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve configurar headers e enviar CSV quando o token for válido', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.exportCsv(mockRes, 'test-secret-key-123', undefined, undefined, undefined);

      expect(service.getExportCsv).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename='),
      );
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('id;protocol;testerName'));
    });
  });

  describe('painel HTML views', () => {
    it('getPainel deve retornar o HTML do dashboard', () => {
      const html = controller.getPainel();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Monitor de Feedbacks & Beta');
    });

    it('getDashboardView deve retornar o HTML do dashboard', () => {
      const html = controller.getDashboardView();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Monitor de Feedbacks & Beta');
    });
  });
});
