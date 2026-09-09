import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { VoteChoice, PledgeStatus, ElectionResult } from '@prisma/client';
import { UpdatePledgeDto } from './dto/update-pledge.dto';

export interface WatchdogAlertItem {
  candidateId: string;
  candidateName: string;
  voteDescription: string;
  pillar: string;
  choice: VoteChoice;
  summaryUrl: string;
  date: Date;
}

@Injectable()
export class WatchdogService {
  // Cache em memória de curta duração para o dashboard (evita recomputações sob carga)
  private dashboardCache: { timestamp: number; data: any } | null = null;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // Endpoints Públicos Stateless
  // ─────────────────────────────────────────────────────────

  async getVotes(candidateId: string, since?: Date) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, name: true, party: true, cargo: true },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    const whereClause: any = { candidateId };
    if (since) {
      whereClause.vote = { date: { gte: since } };
    }

    const candidateVotes = await this.prisma.candidateVote.findMany({
      where: whereClause,
      include: {
        vote: true,
      },
      orderBy: {
        vote: { date: 'desc' },
      },
    });

    return {
      candidate,
      totalVotes: candidateVotes.length,
      votes: candidateVotes.map((cv) => {
        let pillars: string[] = [];
        if (Array.isArray(cv.vote.pillarMapping)) {
          pillars = cv.vote.pillarMapping as string[];
        } else if (typeof cv.vote.pillarMapping === 'string') {
          try {
            pillars = JSON.parse(cv.vote.pillarMapping);
          } catch {
            pillars = [cv.vote.pillarMapping];
          }
        }

        return {
          voteId: cv.vote.id,
          externalId: cv.vote.externalId,
          house: cv.vote.house,
          date: cv.vote.date,
          description: cv.vote.description,
          summaryUrl: cv.vote.summaryUrl,
          pillarMapping: pillars,
          mappedBy: cv.vote.mappedBy,
          choice: cv.choice,
        };
      }),
    };
  }

  /**
   * 100% Stateless: Computa em memória divergências entre a cola do eleitor e as prioridades cívicas.
   * ZERO persistência no banco de dados sobre quem consultou ou quais candidatos estão na cola.
   */
  async getAlerts(candidateIds: string[], priorities: string[]): Promise<WatchdogAlertItem[]> {
    if (!candidateIds || candidateIds.length === 0 || !priorities || priorities.length === 0) {
      return [];
    }

    // Busca apenas os votos dos candidatos informados na requisição
    const candidateVotes = await this.prisma.candidateVote.findMany({
      where: {
        candidateId: { in: candidateIds },
      },
      include: {
        candidate: { select: { id: true, name: true } },
        vote: true,
      },
      orderBy: {
        vote: { date: 'desc' },
      },
    });

    const alerts: WatchdogAlertItem[] = [];

    for (const cv of candidateVotes) {
      let pillars: string[] = [];
      if (Array.isArray(cv.vote.pillarMapping)) {
        pillars = cv.vote.pillarMapping as string[];
      } else if (typeof cv.vote.pillarMapping === 'string') {
        try {
          pillars = JSON.parse(cv.vote.pillarMapping);
        } catch {
          pillars = [cv.vote.pillarMapping];
        }
      }

      // Identifica se a matéria votada afeta algum dos pilares prioritários do cidadão
      const intersectingPillars = pillars.filter((p) => priorities.includes(p));

      // Se há interseção e o candidato votou NÃO (ou esteve AUSENTE/ABSTENÇÃO em matéria crucial progressista)
      if (intersectingPillars.length > 0 && (cv.choice === VoteChoice.NAO || cv.choice === VoteChoice.AUSENTE)) {
        for (const p of intersectingPillars) {
          alerts.push({
            candidateId: cv.candidate.id,
            candidateName: cv.candidate.name,
            voteDescription: cv.vote.description,
            pillar: p,
            choice: cv.choice,
            summaryUrl: cv.vote.summaryUrl,
            date: cv.vote.date,
          });
        }
      }
    }

    return alerts;
  }

  async getPledges(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, name: true, party: true },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    const pledges = await this.prisma.pledge.findMany({
      where: { candidateId },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      candidate,
      totalPledges: pledges.length,
      pledges,
    };
  }

  async getDashboard() {
    const now = Date.now();
    if (this.dashboardCache && now - this.dashboardCache.timestamp < this.CACHE_TTL_MS) {
      return this.dashboardCache.data;
    }

    // Calcula agregados de eleitos
    const electedCandidates = await this.prisma.candidate.findMany({
      where: {
        OR: [
          { electionResult: ElectionResult.ELEITO },
          { cargo: { in: ['DEPUTADO_FEDERAL', 'SENADOR'] } },
        ],
      },
      select: {
        id: true,
        party: true,
        cargo: true,
        profileScores: true,
      },
    });

    const totalElected = electedCandidates.length;
    const electedByParty: Record<string, number> = {};
    const electedByPillar: Record<string, number> = {};

    for (let i = 1; i <= 13; i++) {
      electedByPillar[`p${i}`] = 0;
    }

    for (const c of electedCandidates) {
      if (c.party) {
        electedByParty[c.party] = (electedByParty[c.party] || 0) + 1;
      }
      if (c.profileScores && typeof c.profileScores === 'object') {
        const scores = c.profileScores as Record<string, number>;
        for (let i = 1; i <= 13; i++) {
          const key = `p${i}`;
          if (typeof scores[key] === 'number' && scores[key] >= 0.70) {
            electedByPillar[key] = (electedByPillar[key] || 0) + 1;
          }
        }
      }
    }

    // Taxa de fidelidade de votos por pilar
    const allVotes = await this.prisma.candidateVote.findMany({
      include: { vote: true },
    });

    const pillarLoyaltyTotals: Record<string, { sim: number; total: number }> = {};
    for (let i = 1; i <= 13; i++) {
      pillarLoyaltyTotals[`p${i}`] = { sim: 0, total: 0 };
    }

    const recentDivergences: any[] = [];

    for (const cv of allVotes) {
      let pillars: string[] = [];
      if (Array.isArray(cv.vote.pillarMapping)) {
        pillars = cv.vote.pillarMapping as string[];
      } else if (typeof cv.vote.pillarMapping === 'string') {
        try {
          pillars = JSON.parse(cv.vote.pillarMapping);
        } catch {
          pillars = [cv.vote.pillarMapping];
        }
      }

      for (const p of pillars) {
        if (pillarLoyaltyTotals[p]) {
          pillarLoyaltyTotals[p].total++;
          if (cv.choice === VoteChoice.SIM) {
            pillarLoyaltyTotals[p].sim++;
          }
        }
      }

      if (cv.choice === VoteChoice.NAO && recentDivergences.length < 5) {
        recentDivergences.push({
          candidateId: cv.candidateId,
          voteDescription: cv.vote.description,
          choice: cv.choice,
          date: cv.vote.date,
          summaryUrl: cv.vote.summaryUrl,
        });
      }
    }

    const fidelityByPillar: Record<string, number> = {};
    for (let i = 1; i <= 13; i++) {
      const key = `p${i}`;
      const entry = pillarLoyaltyTotals[key];
      fidelityByPillar[key] = entry.total > 0 ? Number(((entry.sim / entry.total) * 100).toFixed(1)) : 100.0;
    }

    const data = {
      totalElected,
      electedByParty,
      electedByPillar,
      fidelityByPillar,
      topDivergences: recentDivergences,
      cachedAt: new Date(),
    };

    this.dashboardCache = { timestamp: now, data };
    return data;
  }

  // ─────────────────────────────────────────────────────────
  // Operações Administrativas
  // ─────────────────────────────────────────────────────────

  async adminMapVote(voteExternalId: string, pillars: string[]) {
    const vote = await this.prisma.legislativeVote.findUnique({
      where: { externalId: voteExternalId },
    });

    if (!vote) {
      throw new HttpException('Votação não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.prisma.legislativeVote.update({
      where: { externalId: voteExternalId },
      data: {
        pillarMapping: pillars as any,
        mappedBy: 'ADMIN',
      },
    });
  }

  async adminUpdatePledge(id: string, dto: UpdatePledgeDto) {
    const pledge = await this.prisma.pledge.findUnique({ where: { id } });
    if (!pledge) {
      throw new HttpException('Promessa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.prisma.pledge.update({
      where: { id },
      data: {
        status: dto.status,
        evidenceUrl: dto.evidenceUrl || pledge.evidenceUrl,
      },
    });
  }

  async adminUpdateCandidateResult(candidateId: string, electionResult: ElectionResult) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new HttpException('Candidato não encontrado', HttpStatus.NOT_FOUND);
    }

    return this.prisma.candidate.update({
      where: { id: candidateId },
      data: { electionResult },
      select: {
        id: true,
        name: true,
        cargo: true,
        party: true,
        electionResult: true,
      },
    });
  }
}
