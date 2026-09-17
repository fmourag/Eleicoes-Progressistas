import { Controller, Post, Body, HttpStatus, HttpCode, HttpException, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MatchingService } from './matching.service';
import { RankMatchDto } from './dto/rank-match.dto';

@Controller('matching')
export class MatchingController {
  constructor(@Inject(MatchingService) private matchingService: MatchingService) {}

  /**
   * POST /api/matching/rank
   * Consulta por Prioridades (Stateless).
   * Zero coleta de dados, sem cadastro, sem persistência de escolhas.
   * Body: { priority_pillars?: string[] (máx 3), location?: { uf, ibge_code }, includePending?: boolean }
   * Response: { results: top 20, computedAt }
   */
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Post('rank')
  @HttpCode(HttpStatus.OK)
  async rank(@Body() dto: RankMatchDto) {
    if (!RankMatchDto.validate(dto)) {
      throw new HttpException(
        { message: 'priority_pillars must contain at most 3 valid pillars (p1-p13)' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.matchingService.rank(dto);
    return result;
  }

  /**
   * POST /api/matching/compute
   * Alias de compatibilidade retroativa para rank — 100% stateless.
   */
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Post('compute')
  @HttpCode(HttpStatus.OK)
  async compute(@Body() dto: RankMatchDto) {
    return this.rank(dto);
  }
}
