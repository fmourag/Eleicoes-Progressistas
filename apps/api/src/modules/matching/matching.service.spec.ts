import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../common/prisma.service';
import { MatchingLocalService } from '../matching-local/matching-local.service';
import { ConfigService } from '@nestjs/config';
import { EXCLUDED_CONSERVATIVE_PARTIES } from '@np/shared';

describe('MatchingService - Stateless Ranking & Party Exclusion', () => {
  let service: MatchingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    candidate: {
      findMany: jest.fn(),
    },
    matchResult: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    aggregateCounter: {
      upsert: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        MatchingLocalService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'USE_LOCAL_MATCHING') return 'true';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should guarantee that EXCLUDED_CONSERVATIVE_PARTIES contains conservative parties', () => {
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('REPUBLICANOS');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('PL');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('NOVO');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('PP');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('AVANTE');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('MDB');
    expect(EXCLUDED_CONSERVATIVE_PARTIES).toContain('PODEMOS');
  });

  it('should query Prisma candidate.findMany filtering out all excluded parties', async () => {
    mockPrismaService.candidate.findMany.mockResolvedValue([]);

    await service.rank({
      priority_pillars: ['p1', 'p12'],
      location: { uf: 'SP', ibge_code: '3550308' },
    });

    const calls = mockPrismaService.candidate.findMany.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    for (const [queryArg] of calls) {
      expect(queryArg.where).toBeDefined();
      expect(queryArg.where.party).toBeDefined();
      expect(queryArg.where.party.notIn).toBeDefined();
      expect(queryArg.where.party.notIn).toContain('REPUBLICANOS');
      expect(queryArg.where.party.notIn).toEqual(expect.arrayContaining([...EXCLUDED_CONSERVATIVE_PARTIES]));
    }
  });

  it('should be 100% stateless: NEVER persist to match_results table during rank()', async () => {
    const fakeCandidates = [
      {
        id: 'c1',
        tseId: '1001',
        name: 'Candidata 1',
        party: 'PT',
        partyNumber: 13,
        cargo: 'PRESIDENTE',
        state: 'BR',
        candidaturaStatus: 'DEFERIDO',
        fichaLimpa: true,
        profileScores: { p1: 0.9, p12: 0.95 },
      },
    ];

    mockPrismaService.candidate.findMany.mockResolvedValue(fakeCandidates);

    const result = await service.rank({
      priority_pillars: ['p1', 'p12'],
    });

    expect(result.results.length).toBeGreaterThan(0);
    expect(mockPrismaService.matchResult.create).not.toHaveBeenCalled();
    expect(mockPrismaService.matchResult.createMany).not.toHaveBeenCalled();
  });

  it('should never return candidates from excluded conservative parties in match results', async () => {
    const fakeCandidates = [
      {
        id: 'cand-prog-1',
        tseId: '1001',
        name: 'Candidato Progressista',
        socialName: null,
        viceName: null,
        party: 'PT',
        partyNumber: 13,
        photoUrl: null,
        cargo: 'PRESIDENTE',
        state: 'BR',
        candidaturaStatus: 'DEFERIDO',
        fichaLimpa: true,
        profileScores: { p1: 1.0, p2: 1.0 },
      },
      {
        id: 'cand-conserv-1',
        tseId: '1002',
        name: 'Candidato Conservador',
        socialName: null,
        viceName: null,
        party: 'REPUBLICANOS',
        partyNumber: 10,
        photoUrl: null,
        cargo: 'PRESIDENTE',
        state: 'BR',
        candidaturaStatus: 'DEFERIDO',
        fichaLimpa: true,
        profileScores: { p1: 0.1, p2: 0.1 },
      },
    ];

    mockPrismaService.candidate.findMany.mockImplementation((args: any) => {
      const excluded = args?.where?.party?.notIn || [];
      return Promise.resolve(fakeCandidates.filter((c) => !excluded.includes(c.party)));
    });

    const result = await service.rank({
      priority_pillars: ['p1'],
    });

    expect(result.results.length).toBe(1);
    expect(result.results[0].candidate.party).toBe('PT');

    const partiesInResult = result.results.map((r) => r.candidate.party);
    for (const excluded of EXCLUDED_CONSERVATIVE_PARTIES) {
      expect(partiesInResult).not.toContain(excluded);
    }
  });

  it('should increment aggregate counters anonymously without user identifiers', async () => {
    mockPrismaService.candidate.findMany.mockResolvedValue([]);

    await service.recordAggregateMetrics(['p3', 'p1'], 'SP');

    expect(mockPrismaService.aggregateCounter.upsert).toHaveBeenCalled();
    const calls = mockPrismaService.aggregateCounter.upsert.mock.calls;

    // Garante que todas as chaves são estritamente rank:<pillar|total>:<uf>:<data>
    const today = new Date().toISOString().slice(0, 10);
    const keys = calls.map((c: any) => c[0].where.key);
    expect(keys).toContain(`rank:p3:SP:${today}`);
    expect(keys).toContain(`rank:p1:SP:${today}`);
    expect(keys).toContain(`rank:total:SP:${today}`);

    // Garante ausência total de identificadores pessoais
    for (const k of keys) {
      expect(k).not.toContain('device');
      expect(k).not.toContain('user');
      expect(k).not.toContain('session');
    }
  });
});
