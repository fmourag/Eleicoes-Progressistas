import { expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { WatchdogService } from './watchdog.service';
import { WatchdogSyncService } from './watchdog-sync.service';
import { PrismaService } from '../common/prisma.service';
import { VoteChoice, PledgeStatus } from './watchdog.service';

describe('WatchdogService & WatchdogSyncService', () => {
  let service: WatchdogService;
  let syncService: WatchdogSyncService;

  const mockPrismaService = {
    candidate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    candidateVote: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    legislativeVote: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    pledge: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchdogService,
        WatchdogSyncService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WatchdogService>(WatchdogService);
    syncService = module.get<WatchdogSyncService>(WatchdogSyncService);
    jest.clearAllMocks();
  });

  describe('getAlerts (Stateless in-memory calculation)', () => {
    it('should generate alert when candidate voted NAO on a priority pillar', async () => {
      mockPrismaService.candidateVote.findMany.mockResolvedValue([
        {
          candidate: { id: 'c1', name: 'Deputado Silva' },
          choice: VoteChoice.NAO,
          vote: {
            id: 'v1',
            description: 'Marco Legal do Hidrogênio Verde',
            pillarMapping: ['p3', 'p5'],
            summaryUrl: 'https://camara.leg.br/v1',
            date: new Date('2024-06-25'),
          },
        },
      ]);

      const alerts = await service.getAlerts(['c1'], ['p3']);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].candidateId).toBe('c1');
      expect(alerts[0].pillar).toBe('p3');
      expect(alerts[0].choice).toBe(VoteChoice.NAO);
      expect(alerts[0].summaryUrl).toBe('https://camara.leg.br/v1');
    });

    it('should NOT generate alert when candidate voted SIM on a priority pillar', async () => {
      mockPrismaService.candidateVote.findMany.mockResolvedValue([
        {
          candidate: { id: 'c1', name: 'Deputado Silva' },
          choice: VoteChoice.SIM,
          vote: {
            id: 'v1',
            description: 'Marco Legal do Hidrogênio Verde',
            pillarMapping: ['p3'],
            summaryUrl: 'https://camara.leg.br/v1',
            date: new Date('2024-06-25'),
          },
        },
      ]);

      const alerts = await service.getAlerts(['c1'], ['p3']);
      expect(alerts).toHaveLength(0);
    });

    it('should NOT generate alert when vote pillar is not in user priorities', async () => {
      mockPrismaService.candidateVote.findMany.mockResolvedValue([
        {
          candidate: { id: 'c1', name: 'Deputado Silva' },
          choice: VoteChoice.NAO,
          vote: {
            id: 'v1',
            description: 'Matéria de Orçamento',
            pillarMapping: ['p8'],
            summaryUrl: 'https://camara.leg.br/v1',
            date: new Date('2024-06-25'),
          },
        },
      ]);

      const alerts = await service.getAlerts(['c1'], ['p1', 'p2']);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Sync Idempotence & Admin Override', () => {
    it('should upsert votes idempotently by externalId', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        { id: 'c1', cargo: 'DEPUTADO_FEDERAL', electionResult: 'ELEITO' },
      ]);
      mockPrismaService.legislativeVote.findUnique.mockResolvedValue(null);
      mockPrismaService.legislativeVote.upsert.mockResolvedValue({ id: 'v-db-1' });
      mockPrismaService.candidateVote.upsert.mockResolvedValue({});

      const feedItem = {
        house: 'CAMARA' as const,
        externalId: 'ext-vote-1',
        date: new Date(),
        description: 'Votação sobre proteção ao meio ambiente e clima',
        summaryUrl: 'https://camara.leg.br/v1',
        candidateVotes: [{ candidateId: 'c1', choice: VoteChoice.SIM }],
      };

      // 1ª execução
      await syncService.runSync([feedItem]);
      expect(mockPrismaService.legislativeVote.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { externalId: 'ext-vote-1' },
        })
      );
      expect(mockPrismaService.candidateVote.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { candidateId_voteId: { candidateId: 'c1', voteId: 'v-db-1' } },
        })
      );

      // 2ª execução com mesmo externalId
      await syncService.runSync([feedItem]);
      expect(mockPrismaService.legislativeVote.upsert).toHaveBeenCalledTimes(2);
    });

    it('should preserve ADMIN pillar mapping and not overwrite with LLM heuristic', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        { id: 'c1', cargo: 'DEPUTADO_FEDERAL', electionResult: 'ELEITO' },
      ]);
      mockPrismaService.legislativeVote.findUnique.mockResolvedValue({
        id: 'v-db-2',
        externalId: 'ext-vote-2',
        pillarMapping: ['p11'],
        mappedBy: 'ADMIN',
      });
      mockPrismaService.legislativeVote.upsert.mockResolvedValue({ id: 'v-db-2' });
      mockPrismaService.candidateVote.upsert.mockResolvedValue({});

      await syncService.runSync([
        {
          house: 'CAMARA',
          externalId: 'ext-vote-2',
          date: new Date(),
          description: 'Texto genérico sobre escola',
          summaryUrl: 'https://camara.leg.br/v2',
          candidateVotes: [{ candidateId: 'c1', choice: VoteChoice.SIM }],
        },
      ]);

      expect(mockPrismaService.legislativeVote.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            pillarMapping: undefined,
            mappedBy: undefined,
          }),
        })
      );
    });
  });

  describe('Pledge status updates', () => {
    it('should update pledge status and evidenceUrl', async () => {
      mockPrismaService.pledge.findUnique.mockResolvedValue({
        id: 'p-1',
        status: PledgeStatus.PROPOSTA,
      });
      mockPrismaService.pledge.update.mockResolvedValue({
        id: 'p-1',
        status: PledgeStatus.CUMPRIDA,
        evidenceUrl: 'https://evidencia.gov.br',
      });

      const res = await service.adminUpdatePledge('p-1', {
        status: PledgeStatus.CUMPRIDA,
        evidenceUrl: 'https://evidencia.gov.br',
      });

      expect(res.status).toBe(PledgeStatus.CUMPRIDA);
      expect(mockPrismaService.pledge.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: {
          status: PledgeStatus.CUMPRIDA,
          evidenceUrl: 'https://evidencia.gov.br',
        },
      });
    });
  });

  describe('Dashboard caching', () => {
    it('should calculate and cache dashboard statistics', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        { id: 'c1', party: 'PT', cargo: 'DEPUTADO_FEDERAL', profileScores: { p1: 0.85 } },
      ]);
      mockPrismaService.candidateVote.findMany.mockResolvedValue([
        { choice: VoteChoice.SIM, vote: { pillarMapping: ['p1'] } },
        { choice: VoteChoice.NAO, vote: { pillarMapping: ['p1'], description: 'Desc', date: new Date(), summaryUrl: 'http://link' } },
      ]);

      const d1 = await service.getDashboard();
      expect(d1.totalElected).toBe(1);
      expect(d1.electedByParty['PT']).toBe(1);
      expect(d1.fidelityByPillar['p1']).toBe(50.0);

      // Segunda chamada imediata retorna do cache
      const d2 = await service.getDashboard();
      expect(d2).toBe(d1);
    });
  });
});
