import { Controller, Get, Param, Query, UseGuards, Res, Req, Inject } from '@nestjs/common';
import { Response } from 'express';
import { PublicApiService } from './public-api.service';
import { PublicApiKeyGuard } from './guards/public-api-key.guard';
import { TierPaidGuard } from './guards/tier-paid.guard';
import { QueryPublicCandidatesDto } from './dto/query-candidates.dto';

@Controller('public/v1')
@UseGuards(PublicApiKeyGuard)
export class PublicV1Controller {
  constructor(
    @Inject(PublicApiService)
    private readonly publicApiService: PublicApiService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Tier FREE & PAID — Catálogo & Consultas Gerais
  // ─────────────────────────────────────────────────────────

  @Get('pillars')
  getPillars() {
    return this.publicApiService.getPillars();
  }

  @Get('candidates')
  async getCandidates(@Query() query: QueryPublicCandidatesDto) {
    return this.publicApiService.getCandidates(query);
  }

  @Get('candidates/:id')
  async getCandidateById(@Param('id') id: string) {
    return this.publicApiService.getCandidateById(id);
  }

  @Get('candidates/:id/proposals')
  async getCandidateProposals(@Param('id') id: string) {
    return this.publicApiService.getCandidateProposals(id);
  }

  @Get('stats/aggregate')
  async getStatsAggregate() {
    return this.publicApiService.getStatsAggregate();
  }

  // ─────────────────────────────────────────────────────────
  // Tier PAID — Acesso Avançado, Histórico & Dumps em Massa
  // ─────────────────────────────────────────────────────────

  @Get('candidates/:id/voting-history')
  @UseGuards(TierPaidGuard)
  async getCandidateVotingHistory(@Param('id') id: string) {
    return this.publicApiService.getCandidateVotingHistory(id);
  }

  @Get('candidates/:id/integrity')
  @UseGuards(TierPaidGuard)
  async getCandidateIntegrity(@Param('id') id: string) {
    return this.publicApiService.getCandidateIntegrity(id);
  }

  @Get('analytics/pillar-gap')
  @UseGuards(TierPaidGuard)
  async getAnalyticsPillarGap() {
    return this.publicApiService.getAnalyticsPillarGap();
  }

  @Get('exports/candidates.csv')
  @UseGuards(TierPaidGuard)
  async exportCandidatesCsv(@Req() req: any, @Res() res: Response) {
    const csvContent = await this.publicApiService.exportCandidatesCsv(req.apiKey?.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="eleicoes-2026-candidatos.csv"');
    res.send(csvContent);
  }
}
