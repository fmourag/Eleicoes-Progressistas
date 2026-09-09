import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Inject } from '@nestjs/common';
import { WatchdogService } from './watchdog.service';
import { AdminGuard } from '../auth/admin.guard';
import { VoteMappingDto } from './dto/vote-mapping.dto';
import { UpdatePledgeDto } from './dto/update-pledge.dto';
import { UpdateCandidateResultDto } from './dto/update-result.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';
import { QueryVotesDto } from './dto/query-votes.dto';

@Controller('watchdog')
export class WatchdogController {
  constructor(
    @Inject(WatchdogService)
    private readonly watchdogService: WatchdogService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Endpoints Públicos — 100% Stateless para o Cidadão
  // ─────────────────────────────────────────────────────────

  @Get('votes')
  async getVotes(@Query() query: QueryVotesDto) {
    const sinceDate = query.since ? new Date(query.since) : undefined;
    return this.watchdogService.getVotes(query.candidateId, sinceDate);
  }

  @Get('alerts')
  async getAlerts(@Query() query: QueryAlertsDto) {
    const cIds = query.candidateIds ? query.candidateIds.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const pList = query.priorities ? query.priorities.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
    return this.watchdogService.getAlerts(cIds, pList);
  }

  @Get('pledges')
  async getPledges(@Query('candidateId') candidateId: string) {
    return this.watchdogService.getPledges(candidateId);
  }

  @Get('dashboard')
  async getDashboard() {
    return this.watchdogService.getDashboard();
  }

  // ─────────────────────────────────────────────────────────
  // Endpoints Administrativos (AdminGuard)
  // ─────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Post('admin/vote-mapping')
  async mapVote(@Body() dto: VoteMappingDto) {
    return this.watchdogService.adminMapVote(dto.voteExternalId, dto.pillars);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/pledges/:id/status')
  async updatePledge(@Param('id') id: string, @Body() dto: UpdatePledgeDto) {
    return this.watchdogService.adminUpdatePledge(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/candidates/:id/result')
  async updateCandidateResult(@Param('id') id: string, @Body() dto: UpdateCandidateResultDto) {
    return this.watchdogService.adminUpdateCandidateResult(id, dto.electionResult);
  }
}
