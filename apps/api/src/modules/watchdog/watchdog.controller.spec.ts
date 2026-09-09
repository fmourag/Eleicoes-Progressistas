import { Test, TestingModule } from '@nestjs/testing';
import { WatchdogController } from './watchdog.controller';
import { WatchdogService } from './watchdog.service';
import { AdminGuard } from '../auth/admin.guard';
import { ConfigService } from '@nestjs/config';
import { VoteMappingDto } from './dto/vote-mapping.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { UpdateCandidateResultDto, ElectionResult } from './dto/update-result.dto';

describe('WatchdogController - /api/watchdog', () => {
  let controller: WatchdogController;

  const mockWatchdogService = {
    getVotes: jest.fn().mockResolvedValue({
      candidate: { id: 'c1', name: 'Test Candidate', party: 'PT', cargo: 'DEPUTADO_FEDERAL' },
      totalVotes: 1,
      votes: [
        {
          voteId: 'lv-1',
          externalId: 'PL-2564-2020',
          house: 'CAMARA',
          date: new Date('2023-05-10T14:00:00.000Z'),
          description: 'Piso Salarial Nacional da Enfermagem',
          summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2256420',
          pillarMapping: ['p3'],
          mappedBy: 'SYSTEM',
          choice: 'NAO',
        },
      ],
    }),
    getAlerts: jest.fn().mockImplementation((candidateIds: string[], priorities?: string[]) => {
      return Promise.resolve([
        {
          candidateId: 'c1',
          candidateName: 'Test Candidate',
          voteDescription: 'Piso Salarial Nacional da Enfermagem',
          pillar: 'p3',
          choice: 'NAO',
          summaryUrl: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2256420',
          date: new Date('2023-05-10T14:00:00.000Z'),
        },
      ]);
    }),
    getPledges: jest.fn().mockResolvedValue({
      candidate: { id: 'c1', name: 'Test Candidate', party: 'PT' },
      totalPledges: 1,
      pledges: [
        {
          id: 'pledge-1',
          candidateId: 'c1',
          pillar: 'p3',
          text: 'Ampliação do Farmácia Popular',
          status: 'CUMPRIDA',
          evidenceUrl: 'https://agenciagov.ebc.com.br/noticias/202407/farmacia-popular',
        },
      ],
    }),
    getDashboard: jest.fn().mockResolvedValue({
      eleitosPorPilar: { p3: 2, p1: 1 },
      eleitosPorPartido: { PT: 2, PSB: 1 },
      fidelidadeMedia: 88.5,
      topDivergencias: [
        {
          description: 'Piso Salarial Nacional da Enfermagem',
          pillarId: 'p3',
          divergenceCount: 1,
        },
      ],
      totalEleitos: 3,
      totalVotacoes: 6,
    }),
    adminMapVote: jest.fn().mockImplementation((externalId: string, pillars: string[]) => {
      return Promise.resolve({
        id: 'lv-1',
        externalId,
        pillarMapping: pillars,
        mappedBy: 'ADMIN',
      });
    }),
    adminUpdatePledge: jest.fn().mockImplementation((id: string, dto: UpdatePledgeDto) => {
      return Promise.resolve({
        id,
        status: dto.status,
        evidenceUrl: dto.evidenceUrl,
      });
    }),
    adminUpdateCandidateResult: jest.fn().mockImplementation((id: string, result: ElectionResult) => {
      return Promise.resolve({
        id,
        electionResult: result,
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchdogController],
      providers: [
        { provide: WatchdogService, useValue: mockWatchdogService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WatchdogController>(WatchdogController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /votes - should return voting history for candidate', async () => {
    const result = await controller.getVotes({ candidateId: 'c1' });
    expect(result.candidate.id).toBe('c1');
    expect(result.totalVotes).toBe(1);
    expect(result.votes[0].choice).toBe('NAO');
    expect(mockWatchdogService.getVotes).toHaveBeenCalledWith('c1', undefined);
  });

  it('GET /alerts - should return calculated divergences statelessly', async () => {
    const result = await controller.getAlerts({
      candidateIds: 'c1,c2',
      priorities: 'p3,p1',
    });
    expect(result).toHaveLength(1);
    expect(result[0].choice).toBe('NAO');
    expect(result[0].summaryUrl).toContain('camara.leg.br');
    expect(mockWatchdogService.getAlerts).toHaveBeenCalledWith(['c1', 'c2'], ['p3', 'p1']);
  });

  it('GET /pledges - should return promessas with status', async () => {
    const result = await controller.getPledges('c1');
    expect(result.totalPledges).toBe(1);
    expect(result.pledges[0].status).toBe('CUMPRIDA');
    expect(result.pledges[0].evidenceUrl).toBeDefined();
    expect(mockWatchdogService.getPledges).toHaveBeenCalledWith('c1');
  });

  it('GET /dashboard - should return cached aggregates with top divergences', async () => {
    const result = await controller.getDashboard();
    expect(result.totalEleitos).toBe(3);
    expect(result.fidelidadeMedia).toBe(88.5);
    expect(result.topDivergencias[0].divergenceCount).toBe(1);
  });

  it('POST /admin/vote-mapping - should map vote to pillar with ADMIN flag', async () => {
    const dto: VoteMappingDto = {
      voteExternalId: 'PL-2564-2020',
      pillars: ['p3'],
    };
    const result = await controller.mapVote(dto);
    expect(result.mappedBy).toBe('ADMIN');
    expect(result.pillarMapping).toEqual(['p3']);
    expect(mockWatchdogService.adminMapVote).toHaveBeenCalledWith('PL-2564-2020', ['p3']);
  });

  it('PATCH /admin/pledges/:id/status - should update pledge status and evidence', async () => {
    const dto: UpdatePledgeDto = {
      status: 'CUMPRIDA' as any,
      evidenceUrl: 'https://planalto.gov.br/lei-14611',
    };
    const result = await controller.updatePledge('pledge-1', dto);
    expect(result.status).toBe('CUMPRIDA');
    expect(result.evidenceUrl).toBe('https://planalto.gov.br/lei-14611');
    expect(mockWatchdogService.adminUpdatePledge).toHaveBeenCalledWith('pledge-1', dto);
  });

  it('PATCH /admin/candidates/:id/result - should update candidate election result', async () => {
    const dto: UpdateCandidateResultDto = {
      electionResult: ElectionResult.ELEITO,
    };
    const result = await controller.updateCandidateResult('c1', dto);
    expect(result.electionResult).toBe(ElectionResult.ELEITO);
    expect(mockWatchdogService.adminUpdateCandidateResult).toHaveBeenCalledWith('c1', ElectionResult.ELEITO);
  });
});
