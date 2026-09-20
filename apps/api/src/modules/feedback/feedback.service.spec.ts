import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../common/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prisma: any;

  const mockPrismaService = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ id: 1, protocol: 'FB-123456-test' }]),
    feedback: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('deve ser instanciado com sucesso', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar feedback com sucesso e gerar protocolo FB- no padrão esperado', async () => {
      const dto: CreateFeedbackDto = {
        device: 'Samsung Galaxy S22',
        androidVersion: 'Android 14',
        appVersion: '2.2.5',
        nps: 10,
        problema: 'nenhum',
        descricao: 'App excelente e rápido',
        testerName: 'Auditor Cívico',
      };

      prisma.feedback.create.mockResolvedValue({
        id: 42,
        protocol: 'FB-1710000000-abcd',
        ...dto,
      });

      const result = await service.create(dto);

      expect(result).toHaveProperty('id', 42);
      expect(result).toHaveProperty('protocol');
      expect(result).toHaveProperty('reviewCta');
      expect(result.reviewCta).toEqual({
        playStoreUrl: 'https://play.google.com/store/apps/details?id=eleicoes.progressistas',
        testingTrackUrl: 'https://play.google.com/apps/testing/eleicoes.progressistas',
        supportEmail: 'fmourag@gmail.com',
      });
      expect(prisma.feedback.create).toHaveBeenCalledTimes(1);
      const callData = prisma.feedback.create.mock.calls[0][0].data;
      expect(callData.protocol).toMatch(/^FB-\d+-[a-z0-9]+$/);
      expect(callData.nps).toBe(10);
      expect(callData.device).toBe('Samsung Galaxy S22');
      expect(callData.appVersion).toBe('2.2.5');
    });

    it('deve aceitar feedback com dados pessoais nulos (Zero Coleta obrigatória)', async () => {
      const dto: CreateFeedbackDto = {
        device: 'Motorola Edge 40',
        nps: 8,
        problema: 'nenhum',
      };

      prisma.feedback.create.mockResolvedValue({
        id: 43,
        protocol: 'FB-1710000001-efgh',
        ...dto,
      });

      const result = await service.create(dto);

      expect(result.id).toBe(43);
      expect(result.reviewCta).toBeDefined();
      expect(result.reviewCta.playStoreUrl).toContain('eleicoes.progressistas');
      expect(prisma.feedback.create).toHaveBeenCalledTimes(1);
      const callData = prisma.feedback.create.mock.calls[0][0].data;
      expect(callData.testerName).toBeNull();
      expect(callData.email).toBeNull();
      expect(callData.descricao).toBeNull();
      expect(callData.screenshotDesc).toBeNull();
      expect(callData.appVersion).toBe('2.2.7');
    });

    it('deve retornar CTA idêntico e neutro para qualquer NPS [0, 3, 6, 8, 9, 10] e qualquer problema (Fim do Review Gating)', async () => {
      const testCases: Array<{ nps: number; problema: string }> = [
        { nps: 0, problema: 'crash' },
        { nps: 3, problema: 'lentidao' },
        { nps: 6, problema: 'bloqueio' },
        { nps: 8, problema: 'outro' },
        { nps: 9, problema: 'nenhum' },
        { nps: 10, problema: 'nenhum' },
      ];

      for (const tc of testCases) {
        prisma.feedback.create.mockResolvedValue({
          id: 100 + tc.nps,
          protocol: `FB-test-${tc.nps}`,
          device: 'Test Device',
          nps: tc.nps,
          problema: tc.problema,
          appVersion: '2.2.5',
        });

        const res = await service.create({
          device: 'Test Device',
          nps: tc.nps,
          problema: tc.problema,
        });

        // 100% dos usuários recebem exatamente o mesmo CTA com URLs oficiais e e-mail de suporte
        expect(res.reviewCta).toEqual({
          playStoreUrl: 'https://play.google.com/store/apps/details?id=eleicoes.progressistas',
          testingTrackUrl: 'https://play.google.com/apps/testing/eleicoes.progressistas',
          supportEmail: 'fmourag@gmail.com',
        });
      }
    });

    it('deve acionar fallback de query raw caso o Prisma Client falhe', async () => {
      const dto: CreateFeedbackDto = {
        device: 'Xiaomi Redmi Note 13',
        nps: 9,
        problema: 'nenhum',
      };

      prisma.feedback.create.mockRejectedValue(new Error('Prisma schema mismatch'));
      prisma.$queryRawUnsafe.mockResolvedValue([{ id: 99, protocol: 'FB-fallback-123' }]);

      const result = await service.create(dto);

      expect(result.id).toBe(99);
      expect(result.protocol).toBe('FB-fallback-123');
      expect(result.reviewCta).toBeDefined();
      expect(result.reviewCta.playStoreUrl).toContain('eleicoes.progressistas');
      expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('deve calcular métricas de NPS e distribuição de problemas corretamente', async () => {
      prisma.feedback.findMany.mockResolvedValue([
        { id: 1, protocol: 'FB-1', nps: 10, problema: 'nenhum', createdAt: new Date() },
        { id: 2, protocol: 'FB-2', nps: 10, problema: 'nenhum', createdAt: new Date() },
        { id: 3, protocol: 'FB-3', nps: 7, problema: 'lentidao', createdAt: new Date() },
      ]);

      const dashboard = await service.getDashboard();

      expect(dashboard.total).toBe(3);
      expect(dashboard.avgNps).toBe(9); // (10 + 10 + 7) / 3 = 9.0
      expect(dashboard.porProblema).toEqual({
        nenhum: 2,
        lentidao: 1,
      });
      expect(dashboard.ultimos).toHaveLength(3);
    });

    it('deve retornar métricas zeradas se não houver feedbacks', async () => {
      prisma.feedback.findMany.mockResolvedValue([]);

      const dashboard = await service.getDashboard();

      expect(dashboard.total).toBe(0);
      expect(dashboard.avgNps).toBe(0);
      expect(dashboard.porProblema).toEqual({});
      expect(dashboard.ultimos).toEqual([]);
    });
  });

  describe('getExportCsv', () => {
    it('deve gerar CSV sanitizado contra CSV formula injection', async () => {
      prisma.feedback.findMany.mockResolvedValue([
        {
          id: 1,
          protocol: 'FB-1',
          testerName: '=cmd|"/C calc"!A0', // Tentativa maliciosa de injeção de fórmula
          email: '+552199999999',
          device: '@Pixel7',
          androidVersion: '-Android 14',
          appVersion: '2.2.5',
          nps: 10,
          problema: 'nenhum',
          descricao: 'Tudo perfeito',
          screenshotDesc: null,
          createdAt: new Date('2026-09-17T12:00:00Z'),
        },
      ]);

      const csv = await service.getExportCsv();

      expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
      // Todos os caracteres perigosos devem ser prefixados com aspas simples para neutralização
      expect(csv).toContain('"\'=cmd|""/C calc""!A0"');
      expect(csv).toContain("'+552199999999");
      expect(csv).toContain("'@Pixel7");
      expect(csv).toContain("'-Android 14");
    });
  });
});
