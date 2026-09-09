import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { RankMatchDto } from './dto/rank-match.dto';

describe('MatchingController - /api/matching/rank', () => {
  let controller: MatchingController;
  let moduleRef: TestingModule;

  const mockMatchingService = {
    rank: jest.fn().mockImplementation(async (dto: RankMatchDto) => ({
      results: Array.from({ length: 20 }, (_, i) => ({
        id: `cand-${i + 1}`,
        score: 95 - i,
        matchReason: 'Alinhamento com prioridades',
        candidate: {
          id: `cand-${i + 1}`,
          name: `Candidato ${i + 1}`,
          party: 'PT',
          cargo: 'DEPUTADO_FEDERAL',
          fichaLimpa: true,
        },
      })),
      computedAt: new Date().toISOString(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingController],
      providers: [{ provide: MatchingService, useValue: mockMatchingService }],
    }).compile();

    moduleRef = module;
    controller = module.get<MatchingController>(MatchingController);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  it('should return 200 with top 20 candidates when calling /rank with valid priorities', async () => {
    const dto = new RankMatchDto();
    dto.priority_pillars = ['p1', 'p2', 'p12'];
    dto.location = { uf: 'SP', ibge_code: '3550308' };

    const response = await controller.rank(dto);
    expect(response).toBeDefined();
    expect(response.results).toHaveLength(20);
    expect(mockMatchingService.rank).toHaveBeenCalledWith(dto);
    expect(response).toHaveProperty('computedAt');
    expect(response).not.toHaveProperty('deviceHash');
  });

  it('should throw 400 when more than 3 priorities are provided', async () => {
    const dto = new RankMatchDto();
    dto.priority_pillars = ['p1', 'p2', 'p3', 'p4']; // 4 prioridades (máx 3)

    await expect(controller.rank(dto)).rejects.toThrow(HttpException);
    await expect(controller.rank(dto)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
    expect(mockMatchingService.rank).not.toHaveBeenCalled();
  });

  it('should throw 400 when an invalid pillar identifier is provided', async () => {
    const dto = new RankMatchDto();
    dto.priority_pillars = ['p99' as any];

    await expect(controller.rank(dto)).rejects.toThrow(HttpException);
    await expect(controller.rank(dto)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return 200 with no priorities (filtro geral)', async () => {
    const dto = new RankMatchDto();
    dto.priority_pillars = [];

    const response = await controller.rank(dto);
    expect(response.results).toHaveLength(20);
    expect(mockMatchingService.rank).toHaveBeenCalledWith(dto);
  });
});
