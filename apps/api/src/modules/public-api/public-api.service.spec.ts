import { Test, TestingModule } from '@nestjs/testing';
import { PublicApiService } from './public-api.service';
import { PublicApiKeyGuard } from './guards/public-api-key.guard';
import { TierPaidGuard } from './guards/tier-paid.guard';
import { PrismaService } from '../common/prisma.service';
import { OpsModeService } from '../common/ops-mode.service';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';

describe('PublicApiService & Guards', () => {
  let service: PublicApiService;
  let guard: PublicApiKeyGuard;
  let tierGuard: TierPaidGuard;

  const mockPrismaService = {
    apiKey: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    candidate: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    proposal: {
      findMany: jest.fn(),
    },
    integrityFlag: {
      findMany: jest.fn(),
    },
  };

  const mockOpsModeService = {
    getMode: jest.fn().mockReturnValue({ mode: 'full', reason: 'Normal' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicApiService,
        PublicApiKeyGuard,
        TierPaidGuard,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OpsModeService, useValue: mockOpsModeService },
      ],
    }).compile();

    service = module.get<PublicApiService>(PublicApiService);
    guard = module.get<PublicApiKeyGuard>(PublicApiKeyGuard);
    tierGuard = module.get<TierPaidGuard>(TierPaidGuard);
    jest.clearAllMocks();
  });

  describe('createSelfServeKey', () => {
    it('should silently ignore honeypot submissions', async () => {
      const res = await service.createSelfServeKey({
        contactEmail: 'bot@spam.com',
        purpose: 'Spamming',
        website: 'http://spam.com',
      });

      expect(res.tier).toBe('FREE');
      expect(mockPrismaService.apiKey.create).not.toHaveBeenCalled();
    });

    it('should create a FREE key and return plain key once', async () => {
      mockPrismaService.apiKey.create.mockResolvedValue({ id: 'key-1' });

      const res = await service.createSelfServeKey({
        contactEmail: 'pesquisa@usp.br',
        purpose: 'Pesquisa acadêmica sobre eleições 2026',
      });

      expect(res.key.startsWith('pk_free_')).toBe(true);
      expect(res.tier).toBe('FREE');
      expect(res.dailyLimit).toBe(1000);
      expect(mockPrismaService.apiKey.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: 'FREE',
            contactEmail: 'pesquisa@usp.br',
            dailyLimit: 1000,
          }),
        })
      );
    });
  });

  describe('adminCreateKey & adminRevokeKey', () => {
    it('should create a PAID key with 10.000 daily limit', async () => {
      mockPrismaService.apiKey.create.mockResolvedValue({
        id: 'paid-key-1',
        tier: 'PAID',
        dailyLimit: 10000,
        contactEmail: 'jornal@folha.com.br',
      });

      const res = await service.adminCreateKey({
        contactEmail: 'jornal@folha.com.br',
        purpose: 'Cobertura jornalística',
      });

      expect(res.key.startsWith('pk_paid_')).toBe(true);
      expect(res.tier).toBe('PAID');
      expect(res.dailyLimit).toBe(10000);
    });

    it('should revoke a key by setting isActive to false', async () => {
      mockPrismaService.apiKey.findUnique.mockResolvedValue({ id: 'key-rev', isActive: true });
      mockPrismaService.apiKey.update.mockResolvedValue({ id: 'key-rev', isActive: false });

      const res = await service.adminRevokeKey('key-rev');
      expect(res.isActive).toBe(false);
      expect(mockPrismaService.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-rev' },
        data: { isActive: false },
        select: expect.any(Object),
      });
    });
  });

  describe('Public Catalog Queries', () => {
    it('should return all 13 pillars', () => {
      const pillars = service.getPillars();
      expect(pillars).toHaveLength(13);
      expect(pillars[0].id).toBe('p1');
    });

    it('should return candidates without exposing sensitive cpfHash', async () => {
      mockPrismaService.candidate.count.mockResolvedValue(1);
      mockPrismaService.candidate.findMany.mockResolvedValue([
        {
          id: 'cand-1',
          name: 'Candidato Cívico',
          party: 'PARTIDO PROGRESSISTA',
          cargo: 'DEPUTADO_FEDERAL',
          state: 'SP',
          profileScores: { p1: 85, p2: 90 },
        },
      ]);

      const res = await service.getCandidates({ limit: 10, offset: 0 });
      expect(res.total).toBe(1);
      expect(res.items[0].name).toBe('Candidato Cívico');
      expect((res.items[0] as any).cpfHash).toBeUndefined();
    });

    it('should return candidate proposals', async () => {
      mockPrismaService.candidate.findUnique.mockResolvedValue({ id: 'cand-1', name: 'Candidato Cívico' });
      mockPrismaService.proposal.findMany.mockResolvedValue([
        { id: 'prop-1', pillar: 'p1', title: 'SUS Universal' },
      ]);

      const res = await service.getCandidateProposals('cand-1');
      expect(res.totalProposals).toBe(1);
      expect(res.proposals[0].title).toBe('SUS Universal');
    });

    it('should return aggregate statistics with pillar commitment averages', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        { cargo: 'PRESIDENTE', state: 'BR', party: 'PROGRESSISTA', profileScores: { p1: 80, p2: 90 } },
        { cargo: 'GOVERNADOR', state: 'SP', party: 'PROGRESSISTA', profileScores: { p1: 70, p2: 80 } },
      ]);

      const res = await service.getStatsAggregate();
      expect(res.totalCandidates).toBe(2);
      expect(res.byCargo['PRESIDENTE']).toBe(1);
      expect(res.averagePillarCommitment['p1']).toBe(75);
    });
  });

  describe('PAID Tier Features', () => {
    it('should return voting history for candidate', async () => {
      mockPrismaService.candidate.findUnique.mockResolvedValue({
        id: 'cand-1',
        name: 'Deputada Ana',
        party: 'PROGRESSISTA',
        cargo: 'DEPUTADO_FEDERAL',
        votingHistory: [{ pl: 'PL 2564/2020', vote: 'SIM' }],
      });

      const res = await service.getCandidateVotingHistory('cand-1');
      expect(res.votingHistory).toHaveLength(1);
    });

    it('should return integrity flags and fichaLimpa status', async () => {
      mockPrismaService.candidate.findUnique.mockResolvedValue({
        id: 'cand-1',
        name: 'Deputada Ana',
        fichaLimpa: true,
      });
      mockPrismaService.integrityFlag.findMany.mockResolvedValue([]);

      const res = await service.getCandidateIntegrity('cand-1');
      expect(res.fichaLimpa).toBe(true);
      expect(res.flags).toEqual([]);
    });

    it('should return gap analysis against 70.0 republican benchmark', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        { party: 'P1', cargo: 'DEP', profileScores: { p1: 85 } },
      ]);

      const res = await service.getAnalyticsPillarGap();
      expect(res.baselineScore).toBe(70.0);
      expect(res.gapAnalysis[0].pillar).toBe('p1');
      expect(res.gapAnalysis[0].netGap).toBe(15.0);
    });

    it('should generate CSV export and reject second call within 24 hours', async () => {
      mockPrismaService.candidate.findMany.mockResolvedValue([
        {
          id: 'cand-1',
          tseId: '123',
          name: 'Candidato Teste',
          numeroUrna: '13',
          party: 'PART',
          partyNumber: 13,
          cargo: 'PRESIDENTE',
          level: 'FEDERAL',
          candidaturaStatus: 'DEFERIDO',
          state: 'BR',
          municipality: 'Brasília',
          fichaLimpa: true,
          profileScores: { p1: 90 },
        },
      ]);

      const keyId = 'key-export-test';
      const csv = await service.exportCandidatesCsv(keyId);
      expect(csv).toContain('id,tseId,name');
      expect(csv).toContain('Candidato Teste');

      // Segunda chamada no mesmo dia deve falhar com 429
      await expect(service.exportCandidatesCsv(keyId)).rejects.toThrow(
        'O dump completo de candidatos em CSV é restrito a 1 solicitação a cada 24 horas'
      );
    });
  });

  describe('PublicApiKeyGuard', () => {
    function createMockContext(headers: Record<string, string>): { context: ExecutionContext; resHeaders: Record<string, string> } {
      const resHeaders: Record<string, string> = {};
      const req: any = { headers };
      const res: any = {
        setHeader: (k: string, v: string) => { resHeaders[k] = v; },
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
          getResponse: () => res,
        }),
      } as unknown as ExecutionContext;

      return { context, resHeaders };
    }

    it('should throw 401 if x-api-key header is missing', async () => {
      const { context } = createMockContext({});
      await expect(guard.canActivate(context)).rejects.toThrow('Chave de API ausente');
    });

    it('should throw 401 if key is not found in database', async () => {
      const { context } = createMockContext({ 'x-api-key': 'pk_free_invalid' });
      mockPrismaService.apiKey.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow('Chave de API inválida');
    });

    it('should throw 403 if key is revoked/inactive', async () => {
      const key = 'pk_free_test123';
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');
      const { context } = createMockContext({ 'x-api-key': key });

      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        keyHash,
        isActive: false,
      });

      await expect(guard.canActivate(context)).rejects.toThrow('Chave de API inativa ou revogada');
    });

    it('should throw 410 if ops-mode is archive', async () => {
      mockOpsModeService.getMode.mockReturnValueOnce({ mode: 'archive', reason: 'Histórico' });
      const { context } = createMockContext({ 'x-api-key': 'pk_free_test' });

      await expect(guard.canActivate(context)).rejects.toThrow('Sistema em modo archive histórico');
    });

    it('should throw 429 if daily limit is exceeded and inject rate limit headers', async () => {
      const key = 'pk_free_test123';
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');
      const { context, resHeaders } = createMockContext({ 'x-api-key': key });

      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        keyHash,
        isActive: true,
        dailyLimit: 1000,
        usageCount: 1000,
        usageResetAt: new Date(),
      });

      await expect(guard.canActivate(context)).rejects.toThrow('Limite diário de requisições excedido');
      expect(resHeaders['X-RateLimit-Limit']).toBe('1000');
      expect(resHeaders['X-RateLimit-Remaining']).toBe('0');
      expect(resHeaders['X-RateLimit-Reset']).toBeDefined();
    });

    it('should pass and increment usageCount when valid within limits', async () => {
      const key = 'pk_free_test123';
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');
      const { context, resHeaders } = createMockContext({ 'x-api-key': key });

      mockPrismaService.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        keyHash,
        isActive: true,
        dailyLimit: 1000,
        usageCount: 50,
        usageResetAt: new Date(),
      });
      mockPrismaService.apiKey.update.mockResolvedValue({});

      const can = await guard.canActivate(context);
      expect(can).toBe(true);
      expect(resHeaders['X-RateLimit-Limit']).toBe('1000');
      expect(resHeaders['X-RateLimit-Remaining']).toBe('949');
      expect(mockPrismaService.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: expect.objectContaining({
          usageCount: { increment: 1 },
        }),
      });
    });
  });

  describe('TierPaidGuard', () => {
    it('should throw 403 TIER_UPGRADE_REQUIRED if key is FREE', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ apiKey: { tier: 'FREE' } }),
        }),
      } as unknown as ExecutionContext;

      expect(() => tierGuard.canActivate(context)).toThrow(HttpException);
    });

    it('should allow access if key tier is PAID', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ apiKey: { tier: 'PAID' } }),
        }),
      } as unknown as ExecutionContext;

      expect(tierGuard.canActivate(context)).toBe(true);
    });
  });
});
