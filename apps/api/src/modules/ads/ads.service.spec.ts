import { Test, TestingModule } from '@nestjs/testing';
import { AdsService } from './ads.service';
import { PrismaService } from '../common/prisma.service';

describe('AdsService', () => {
  let service: AdsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ad: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    advertiser: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    adOptOut: {
      upsert: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdsService>(AdsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('isElectionPeriod', () => {
    it('should return true for date during election period (e.g. 20/09)', () => {
      const electionDate = new Date(2026, 8, 20); // 20 de setembro (mês 8 em 0-index)
      expect(service.isElectionPeriod(electionDate)).toBe(true);
    });

    it('should return true for 16/08 and 05/10 boundary dates', () => {
      const startDate = new Date(2026, 7, 16, 10, 0); // 16 de agosto
      const endDate = new Date(2026, 9, 5, 20, 0);   // 05 de outubro
      expect(service.isElectionPeriod(startDate)).toBe(true);
      expect(service.isElectionPeriod(endDate)).toBe(true);
    });

    it('should return false for date outside election period (e.g. 10/05)', () => {
      const nonElectionDate = new Date(2026, 4, 10); // 10 de maio
      expect(service.isElectionPeriod(nonElectionDate)).toBe(false);
    });
  });

  describe('getContextualAd (CPM accounting)', () => {
    it('should return null and NOT increment impressions if within election period', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(true);
      const result = await service.getContextualAd('matching', 'p3');
      expect(result).toBeNull();
      expect(mockPrismaService.ad.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.ad.update).not.toHaveBeenCalled();
    });

    it('should return contextual ad and increment impression when outside election period', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(false);
      const mockAd = {
        id: 'ad-1',
        title: 'Energia Solar Popular',
        description: 'Cooperativa de energia renovável',
        screen: 'matching',
        pillar: 'p3',
        isActive: true,
      };
      mockPrismaService.ad.findFirst.mockResolvedValue(mockAd);

      const result = await service.getContextualAd('matching', 'p3');
      expect(result).toEqual(mockAd);
      expect(mockPrismaService.ad.update).toHaveBeenCalledWith({
        where: { id: 'ad-1' },
        data: { impressions: { increment: 1 } },
      });
    });

    it('should increment impressions twice on 2 consecutive calls outside election period', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(false);
      const mockAd = {
        id: 'ad-1',
        title: 'Energia Solar Popular',
        screen: 'matching',
        isActive: true,
      };
      mockPrismaService.ad.findFirst.mockResolvedValue(mockAd);

      await service.getContextualAd('matching');
      await service.getContextualAd('matching');

      expect(mockPrismaService.ad.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.ad.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'ad-1' },
        data: { impressions: { increment: 1 } },
      });
      expect(mockPrismaService.ad.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'ad-1' },
        data: { impressions: { increment: 1 } },
      });
    });
  });

  describe('recordClick', () => {
    it('should increment clicks for the ad', async () => {
      await service.recordClick('ad-123');
      expect(mockPrismaService.ad.update).toHaveBeenCalledWith({
        where: { id: 'ad-123' },
        data: { clicks: { increment: 1 } },
      });
    });
  });

  describe('getTransparencyReport', () => {
    it('should calculate total advertisers and revenue with parsed pillars', async () => {
      mockPrismaService.advertiser.findMany.mockResolvedValue([
        {
          name: 'Cooperativa Solar',
          cnpj: '11.111.111/0001-11',
          category: 'COOPERATIVA',
          pillarAlignment: ['p3'],
          contractValue: 5000,
          ads: [{ isActive: true }, { isActive: false }],
        },
        {
          name: 'Editora Progressista',
          cnpj: '22.222.222/0001-22',
          category: 'EMPRESA_SUSTENTAVEL',
          pillarAlignment: '["p11"]',
          contractValue: 3000,
          ads: [{ isActive: true }],
        },
      ]);

      const report = await service.getTransparencyReport();
      expect(report.totalAdvertisers).toBe(2);
      expect(report.totalRevenue).toBe(8000);
      expect(report.advertisers[0].pillars).toEqual(['p3']);
      expect(report.advertisers[1].pillars).toEqual(['p11']);
      expect(report.advertisers[0].activeAds).toBe(1);
    });
  });

  describe('optOut and hasOptedOut', () => {
    it('should store opt-out expiring in 30 days', async () => {
      await service.optOut('hash-123');
      expect(mockPrismaService.adOptOut.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deviceHash: 'hash-123' },
          create: expect.objectContaining({ deviceHash: 'hash-123' }),
        })
      );
    });

    it('should return true if opt-out exists and has not expired', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
      mockPrismaService.adOptOut.findUnique.mockResolvedValue({
        deviceHash: 'hash-123',
        expiresAt: future,
      });

      const optedOut = await service.hasOptedOut('hash-123');
      expect(optedOut).toBe(true);
    });

    it('should return false if opt-out does not exist', async () => {
      mockPrismaService.adOptOut.findUnique.mockResolvedValue(null);
      const optedOut = await service.hasOptedOut('hash-unknown');
      expect(optedOut).toBe(false);
    });
  });

  describe('createAdvertiser', () => {
    it('should create an advertiser with isApproved: false', async () => {
      mockPrismaService.advertiser.create.mockResolvedValue({
        id: 'adv-new',
        name: 'ONG Cidadania Ativa',
        cnpj: '99.999.999/0001-99',
        category: 'ONG',
        pillarAlignment: ['p1', 'p2'],
        isActive: true,
        isApproved: false,
      });

      const res = await service.createAdvertiser({
        name: 'ONG Cidadania Ativa',
        cnpj: '99.999.999/0001-99',
        category: 'ONG',
        pillarAlignment: ['p1', 'p2'],
      });

      expect(res.isApproved).toBe(false);
      expect(mockPrismaService.advertiser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'ONG Cidadania Ativa',
            isApproved: false,
          }),
        }),
      );
    });
  });

  describe('toggleApproval', () => {
    it('should toggle isApproved from false to true', async () => {
      mockPrismaService.advertiser.findUnique.mockResolvedValue({
        id: 'adv-1',
        isApproved: false,
      });
      mockPrismaService.advertiser.update.mockResolvedValue({
        id: 'adv-1',
        isApproved: true,
      });

      const res = await service.toggleApproval('adv-1');
      expect(res.isApproved).toBe(true);
      expect(mockPrismaService.advertiser.update).toHaveBeenCalledWith({
        where: { id: 'adv-1' },
        data: { isApproved: true },
      });
    });
  });

  describe('getAdminReport', () => {
    it('should return CTR per ad and total revenue', async () => {
      mockPrismaService.ad.findMany.mockResolvedValue([
        {
          id: 'ad-1',
          title: 'Ad 1',
          screen: 'search',
          format: 'BANNER',
          pillar: null,
          impressions: 100,
          clicks: 5,
          advertiserId: 'adv-1',
          advertiser: { name: 'Adv 1' },
          isActive: true,
        },
      ]);
      mockPrismaService.advertiser.findMany.mockResolvedValue([
        { contractValue: 10000, isActive: true, isApproved: true },
      ]);

      const report = await service.getAdminReport();
      expect(report.totalRevenue).toBe(10000);
      expect(report.ads[0].ctr).toBe(0.05);
      expect(report.ads[0].advertiserName).toBe('Adv 1');
    });
  });

  describe('getColaFooterAd', () => {
    it('should return null during blackout', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(true);
      const res = await service.getColaFooterAd();
      expect(res).toBeNull();
      expect(mockPrismaService.ad.findFirst).not.toHaveBeenCalled();
    });

    it('should return null if opted out', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(false);
      jest.spyOn(service, 'hasOptedOut').mockResolvedValue(true);
      const res = await service.getColaFooterAd('hash-123');
      expect(res).toBeNull();
    });

    it('should return ad and increment impression when active outside blackout', async () => {
      jest.spyOn(service, 'isElectionPeriod').mockReturnValue(false);
      jest.spyOn(service, 'hasOptedOut').mockResolvedValue(false);
      const mockAd = { id: 'cola-ad', format: 'COLA_FOOTER', advertiser: { name: 'Adv' } };
      mockPrismaService.ad.findFirst.mockResolvedValue(mockAd);

      const res = await service.getColaFooterAd('hash-123');
      expect(res).toEqual(mockAd);
      expect(mockPrismaService.ad.update).toHaveBeenCalledWith({
        where: { id: 'cola-ad' },
        data: { impressions: { increment: 1 } },
      });
    });
  });

  describe('apply (Self-Service Onboarding)', () => {
    it('should ignore silently if honeypot website field is present', async () => {
      const res = await service.apply({
        name: 'Bot Spam',
        cnpj: '11.222.333/0001-44',
        category: 'COOPERATIVA',
        pillarAlignment: ['p1'],
        website: 'http://spam-link.com',
      } as any);

      expect(res.protocol).toBe('ok');
      expect(mockPrismaService.advertiser.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if CNPJ is already registered', async () => {
      mockPrismaService.advertiser.findFirst.mockResolvedValue({ id: 'adv-exist', cnpj: '11.222.333/0001-44' });

      await expect(
        service.apply({
          name: 'Empresa Teste',
          cnpj: '11.222.333/0001-44',
          category: 'COOPERATIVA',
          pillarAlignment: ['p3'],
          contactName: 'Contato Teste',
          contactEmail: 'teste@empresa.com',
        })
      ).rejects.toThrow('CNPJ já cadastrado');
    });

    it('should create proposal with status PROPOSTA and return protocol', async () => {
      mockPrismaService.advertiser.findFirst.mockResolvedValue(null);
      mockPrismaService.advertiser.create.mockResolvedValue({
        id: 'adv-new-prop',
        name: 'Cooperativa Solar',
        cnpj: '11.222.333/0001-44',
        status: 'PROPOSTA',
      });

      const res = await service.apply({
        name: 'Cooperativa Solar',
        cnpj: '11.222.333/0001-44',
        category: 'COOPERATIVA',
        pillarAlignment: ['p3'],
        contactName: 'Maria Silva',
        contactEmail: 'maria@solar.coop.br',
      });

      expect(res.protocol).toBe('adv-new-prop');
      expect(res.sla).toBe('48h');
      expect(mockPrismaService.advertiser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PROPOSTA',
            isApproved: false,
          }),
        })
      );
    });
  });

  describe('getApplications', () => {
    it('should return advertisers with status PROPOSTA or EM_ANALISE', async () => {
      mockPrismaService.advertiser.findMany.mockResolvedValue([
        { id: 'app-1', status: 'PROPOSTA' },
        { id: 'app-2', status: 'EM_ANALISE' },
      ]);

      const res = await service.getApplications();
      expect(res).toHaveLength(2);
      expect(mockPrismaService.advertiser.findMany).toHaveBeenCalledWith({
        where: { status: { in: ['PROPOSTA', 'EM_ANALISE'] } },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('reviewAdvertiser', () => {
    it('should throw 404 if advertiser not found', async () => {
      mockPrismaService.advertiser.findUnique.mockResolvedValue(null);
      await expect(
        service.reviewAdvertiser('none', { decision: 'APROVADO' as any })
      ).rejects.toThrow('Anunciante não encontrado');
    });

    it('should update status and isApproved', async () => {
      mockPrismaService.advertiser.findUnique.mockResolvedValue({
        id: 'adv-rev',
        status: 'PROPOSTA',
        applicationNote: 'Nota inicial',
      });
      mockPrismaService.advertiser.update.mockResolvedValue({
        id: 'adv-rev',
        status: 'APROVADO',
        isApproved: true,
      });

      const res = await service.reviewAdvertiser('adv-rev', {
        decision: 'APROVADO' as any,
        note: 'Documentação validada',
      });

      expect(res.status).toBe('APROVADO');
      expect(mockPrismaService.advertiser.update).toHaveBeenCalledWith({
        where: { id: 'adv-rev' },
        data: expect.objectContaining({
          status: 'APROVADO',
          isApproved: true,
          applicationNote: 'Nota inicial\n[Review]: Documentação validada',
        }),
      });
    });
  });

  describe('contractAdvertiser', () => {
    it('should throw 400 if startDate is before 2026-10-05', async () => {
      mockPrismaService.advertiser.findUnique.mockResolvedValue({ id: 'adv-c' });

      await expect(
        service.contractAdvertiser('adv-c', {
          startDate: '2026-09-10T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
          contractValue: 5000,
        })
      ).rejects.toThrow('A data de início do contrato deve ser a partir de 05/10/2026');
    });

    it('should activate contract when startDate is valid', async () => {
      mockPrismaService.advertiser.findUnique.mockResolvedValue({ id: 'adv-c' });
      mockPrismaService.advertiser.update.mockResolvedValue({
        id: 'adv-c',
        status: 'ATIVO',
        contractValue: 5000,
      });

      const res = await service.contractAdvertiser('adv-c', {
        startDate: '2026-10-06T00:00:00.000Z',
        endDate: '2027-04-06T00:00:00.000Z',
        contractValue: 5000,
      });

      expect(res.status).toBe('ATIVO');
      expect(mockPrismaService.advertiser.update).toHaveBeenCalledWith({
        where: { id: 'adv-c' },
        data: expect.objectContaining({
          status: 'ATIVO',
          isActive: true,
          isApproved: true,
          contractValue: 5000,
        }),
      });
    });
  });

  describe('getActivationStatus', () => {
    it('should report blackout active during campaign period', () => {
      const duringBlackout = new Date(2026, 8, 8); // 08/09/2026
      const status = service.getActivationStatus(duringBlackout);
      expect(status.servingNow).toBe(false);
      expect(status.daysRemaining).toBeGreaterThan(0);
      expect(status.blackoutUntil).toBe('2026-10-05');
    });

    it('should report servingNow true after election blackout', () => {
      const afterBlackout = new Date(2026, 9, 6); // 06/10/2026
      const status = service.getActivationStatus(afterBlackout);
      expect(status.servingNow).toBe(true);
      expect(status.daysRemaining).toBe(0);
    });
  });
});
