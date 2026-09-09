import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../common/prisma.service';
import { OpsModeService } from '../common/ops-mode.service';

describe('FinanceService', () => {
  let service: FinanceService;

  const mockPrismaService = {
    donationEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    advertiser: {
      findMany: jest.fn(),
    },
  };

  const mockOpsModeService = {
    getMode: jest.fn().mockReturnValue({ mode: 'full', reason: 'ok', since: '2026-01-01' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OpsModeService, useValue: mockOpsModeService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    jest.clearAllMocks();
  });

  describe('recordDonation (idempotency)', () => {
    it('should create donation record when eventId is new', async () => {
      mockPrismaService.donationEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.donationEvent.create.mockResolvedValue({
        id: 'don-1',
        provider: 'MERCADO_PAGO',
        eventId: 'evt-100',
        amountCents: 1500,
        createdAt: new Date(),
      });

      const res = await service.recordDonation({
        provider: 'MERCADO_PAGO',
        eventId: 'evt-100',
        amountCents: 1500,
      });

      expect(res.duplicate).toBe(false);
      expect(res.donation?.amountCents).toBe(1500);
      expect(mockPrismaService.donationEvent.create).toHaveBeenCalled();
    });

    it('should return existing record and NOT call create when eventId already exists', async () => {
      const existing = {
        id: 'don-1',
        provider: 'MERCADO_PAGO',
        eventId: 'evt-100',
        amountCents: 1500,
        createdAt: new Date(),
      };
      mockPrismaService.donationEvent.findUnique.mockResolvedValue(existing);

      const res = await service.recordDonation({
        provider: 'MERCADO_PAGO',
        eventId: 'evt-100',
        amountCents: 1500,
      });

      expect(res.duplicate).toBe(true);
      expect(res.donation).toEqual(existing);
      expect(mockPrismaService.donationEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('getCostsBreakdown & Transparency', () => {
    it('should correctly calculate costs, donations and break-even status', async () => {
      mockPrismaService.donationEvent.findMany.mockResolvedValue([
        { amountCents: 2000 },
        { amountCents: 3000 },
      ]);
      mockPrismaService.advertiser.findMany.mockResolvedValue([
        { contractValue: 100 },
      ]);

      const res = await service.getCostsBreakdown(new Date(2026, 4, 1));
      expect(res.revenue.donationsBrl).toBe(50.0);
      expect(res.revenue.ethicalAdsBrl).toBe(100.0);
      expect(res.revenue.totalAccumulatedRevenueBrl).toBe(150.0);
      expect(res.breakEven.isBreakEven).toBe(true);
    });
  });
});
