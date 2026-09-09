import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'node:crypto';
import { PrismaService } from '../common/prisma.service';
import { RankMatchDto } from './dto/rank-match.dto';
import { MatchingLocalService } from '../matching-local/matching-local.service';

import { UPCOMING_ELECTION, EXCLUDED_CONSERVATIVE_PARTIES, PILLARS } from '@np/shared';

const MAX_CANDIDATES = 100;
const TOP_N = 20;

interface PythonCandidate {
  id: string;
  tse_id: string;
  name: string;
  party: string;
  ficha_limpa: boolean;
  pillar_focus: Record<string, number>;
}

interface PythonMatchResult {
  candidate_id: string;
  candidate_name: string;
  match_score: number;
  match_reason: string;
  is_estimated: boolean;
  priority_aligned: string[];
}

interface PythonBatchResponse {
  results: PythonMatchResult[];
}

interface CandidateLite {
  id: string;
  tseId: string;
  name: string;
  socialName: string | null;
  viceName: string | null;
  party: string;
  partyNumber: number;
  photoUrl: string | null;
  cargo: string;
  level?: string;
  state: string;
  municipality?: string;
  candidaturaStatus: string;
  dataRegistro?: Date;
  fichaLimpa: boolean;
  profileScores?: Record<string, unknown> | null;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private matchingUrl: string;
  private apiKey: string;
  private useLocalMatching: boolean;

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(MatchingLocalService) private matchingLocalService: MatchingLocalService,
    @Inject(ConfigService) private config?: ConfigService,
  ) {
    this.matchingUrl = this.config?.get('MATCHING_SERVICE_URL') || process.env.MATCHING_SERVICE_URL || 'http://localhost:8002';
    this.apiKey = this.config?.get('MATCHING_API_KEY') || process.env.MATCHING_API_KEY || '';
    this.useLocalMatching = (this.config?.get('USE_LOCAL_MATCHING') || process.env.USE_LOCAL_MATCHING) === 'true';
    
    if (!process.env.DEVICE_HASH_SALT) {
      process.env.DEVICE_HASH_SALT = 'default-dev-salt-key';
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredMatches() {
    try {
      const result = await this.prisma.matchResult.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
      this.logger.log(`Expired matches cleanup completed: ${result.count} records removed.`);
    } catch (err) {
      this.logger.error(`Failed to cleanup expired matches: ${(err as Error).message}`);
    }
  }

  /**
   * POST /api/matching/rank — Consulta por Prioridades (Stateless)
   * Nenhuma persistência de escolhas ou opiniões. Zero tracking.
   */
  async rank(dto: RankMatchDto) {
    const uf = dto.location?.uf;
    const ibgeCode = dto.location?.ibge_code;
    const priorityPillars = dto.priority_pillars || [];
    let candidates: CandidateLite[];

    try {
      candidates = await this.findCandidates(uf, ibgeCode, dto.includePending ?? true);
    } catch {
      return {
        results: [],
        isFallback: true,
        message: 'Sistema temporariamente indisponível. Tente novamente em alguns minutos.',
        computedAt: new Date().toISOString(),
      };
    }

    if (!candidates.length) {
      return {
        results: [],
        isFallback: true,
        message: 'Nenhum candidato disponível para a sua região no momento. Estamos atualizando a base conforme o TSE — tente novamente em alguns minutos.',
        computedAt: new Date().toISOString(),
      };
    }

    let formattedResults: any[] = [];

    try {
      let pythonResults: PythonMatchResult[] = [];
      if (this.useLocalMatching) {
        this.logger.log('Using local TypeScript matching service');
        pythonResults = candidates.map((c) => {
          const profileScores = this.normalizeProfileScores(c.profileScores);
          const localMatch = this.matchingLocalService.rankByPillars(
            profileScores,
            priorityPillars,
            c.fichaLimpa,
          );
          return {
            candidate_id: c.id,
            candidate_name: c.name,
            match_score: localMatch.score,
            match_reason: localMatch.reason,
            is_estimated: localMatch.isEstimated,
            priority_aligned: localMatch.priorityAligned,
          };
        });
        pythonResults.sort((a, b) => b.match_score - a.match_score);
      } else {
        pythonResults = await this.callPythonBatch(priorityPillars, candidates);
      }

      formattedResults = pythonResults.map((r) => {
        const candidate = candidates.find((c) => c.id === r.candidate_id);
        return {
          id: r.candidate_id,
          score: r.match_score,
          matchReason: r.match_reason,
          isEstimated: r.is_estimated,
          priorityAligned: r.priority_aligned,
          candidate: candidate ? {
            id: candidate.id,
            name: candidate.name,
            socialName: candidate.socialName,
            viceName: candidate.viceName,
            party: candidate.party,
            partyNumber: candidate.partyNumber,
            tseId: candidate.tseId,
            cargo: candidate.cargo,
            level: candidate.level,
            state: candidate.state,
            municipality: candidate.municipality,
            candidaturaStatus: candidate.candidaturaStatus,
            fichaLimpa: candidate.fichaLimpa,
            photoUrl: candidate.photoUrl,
          } : {
            id: r.candidate_id,
            name: r.candidate_name,
            party: 'IND',
            cargo: 'VEREADOR',
            fichaLimpa: true,
          },
        };
      });
    } catch {
      this.logger.warn('Python matching service unavailable. Using in-memory fallback ranking.');
      formattedResults = this.computeInMemoryFallback(priorityPillars, candidates);
    }

    // Fire-and-forget de contadores puramente agregados (sem identificadores de usuário ou dispositivo)
    this.recordAggregateMetrics(priorityPillars, uf).catch(() => {});

    // Retorna estritamente top 20 (TOP_N), de forma 100% stateless (SEM gravação em MatchResult)
    return {
      results: formattedResults.slice(0, TOP_N),
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Telemetria estritamente agregada: incrementa contadores numéricos diários por UF/Pilar.
   * Zero identificadores (IP, deviceHash, token, sessão ou usuário).
   */
  async recordAggregateMetrics(priorityPillars: string[], uf?: string): Promise<void> {
    const configVal = this.config ? this.config.get('AGGREGATE_METRICS_ENABLED') : null;
    const enabled = (configVal ?? process.env.AGGREGATE_METRICS_ENABLED ?? 'true') !== 'false';
    if (!enabled) return;

    const stateCode = uf && uf.length === 2 ? uf.toUpperCase() : 'BR';
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
      const keysToIncrement: string[] = [];
      for (const p of priorityPillars) {
        if (p && typeof p === 'string') {
          keysToIncrement.push(`rank:${p.toLowerCase()}:${stateCode}:${today}`);
        }
      }
      keysToIncrement.push(`rank:total:${stateCode}:${today}`);

      for (const key of keysToIncrement) {
        if (this.prisma.aggregateCounter) {
          await this.prisma.aggregateCounter.upsert({
            where: { key },
            create: { key, count: 1 },
            update: { count: { increment: 1 } },
          }).catch(() => {});
        }
      }
    } catch {
      // Falha silenciosa: telemetria nunca pode impactar o fluxo do eleitor
    }
  }

  // Alias para retrocompatibilidade sem persistência
  async compute(_deviceHash: string, dto: RankMatchDto) {
    return this.rank(dto);
  }

  private async findCandidates(uf?: string, ibgeCode?: string, includePending = true) {
    const upcomingCargos = UPCOMING_ELECTION.cargos as string[];
    const excludedParties = [...EXCLUDED_CONSERVATIVE_PARTIES] as string[];
    const targetYear = UPCOMING_ELECTION.year;
    const allowedStatus = includePending ? ['DEFERIDO', 'EM_ANALISE'] : ['DEFERIDO'];

    try {
      const presidentialCandidates = await this.prisma.candidate.findMany({
        where: {
          cargo: 'PRESIDENTE',
          electionYear: targetYear,
          candidaturaStatus: { in: allowedStatus as any },
          party: { notIn: excludedParties },
          fichaLimpa: true,
        } as any,
        select: {
          id: true,
          tseId: true,
          name: true,
          socialName: true,
          viceName: true,
          party: true,
          partyNumber: true,
          photoUrl: true,
          cargo: true,
          state: true,
          municipality: true,
          candidaturaStatus: true,
          dataRegistro: true,
          fichaLimpa: true,
          profileScores: true,
        } as any,
        take: 10,
      });

      const stateCargos = upcomingCargos.filter((c) => c !== 'PRESIDENTE');

      const stateCandidates = await this.prisma.candidate.findMany({
        where: {
          ...(uf ? { state: uf } : {}),
          cargo: { in: stateCargos as any },
          electionYear: targetYear,
          candidaturaStatus: { in: allowedStatus as any },
          party: { notIn: excludedParties },
          fichaLimpa: true,
        } as any,
        select: {
          id: true,
          tseId: true,
          name: true,
          socialName: true,
          viceName: true,
          party: true,
          partyNumber: true,
          photoUrl: true,
          cargo: true,
          state: true,
          municipality: true,
          candidaturaStatus: true,
          dataRegistro: true,
          fichaLimpa: true,
          profileScores: true,
        } as any,
        take: MAX_CANDIDATES,
      });

      const combinedMap = new Map<string, any>();
      for (const c of [...presidentialCandidates, ...stateCandidates]) {
        combinedMap.set((c as any).id, c);
      }

      for (const cargo of upcomingCargos) {
        const existingForCargo = Array.from(combinedMap.values()).filter((c) => c.cargo === cargo);
        if (existingForCargo.length < 3) {
          const extraForCargo = await this.prisma.candidate.findMany({
            where: {
              cargo: cargo as any,
              ...(uf ? { state: uf } : {}),
              electionYear: targetYear,
              candidaturaStatus: { in: allowedStatus as any },
              party: { notIn: excludedParties },
              fichaLimpa: true,
              id: { notIn: Array.from(combinedMap.keys()) },
            } as any,
            select: {
              id: true,
              tseId: true,
              name: true,
              socialName: true,
              viceName: true,
              party: true,
              partyNumber: true,
              photoUrl: true,
              cargo: true,
              candidaturaStatus: true,
              dataRegistro: true,
              fichaLimpa: true,
              profileScores: true,
            } as any,
            take: 3 - existingForCargo.length,
          });

          for (const c of extraForCargo) {
            combinedMap.set((c as any).id, c);
          }
        }
      }

      return Array.from(combinedMap.values());
    } catch (error) {
      this.logger.warn(`[MatchingService] Database error or offline: ${(error as Error).message}`);
      throw error;
    }
  }

  private async callPythonBatch(
    priorityPillars: string[],
    candidates: { id: string; tseId: string; name: string; party: string; fichaLimpa: boolean; profileScores?: Record<string, unknown> | null }[],
  ): Promise<PythonMatchResult[]> {
    const pythonCandidates: PythonCandidate[] = candidates.map((c) => ({
      id: c.id,
      tse_id: c.tseId,
      name: c.name,
      party: c.party,
      ficha_limpa: c.fichaLimpa,
      pillar_focus: this.normalizeProfileScores(c.profileScores),
    }));

    const body = {
      priority_pillars: priorityPillars,
      candidates: pythonCandidates,
    };

    const res = await fetch(`${this.matchingUrl}/matching/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Python service status ${res.status}: ${text}`);
    }

    const data = (await res.json()) as PythonBatchResponse;
    return data.results ?? [];
  }

  private computeInMemoryFallback(priorityPillars: string[], candidates: CandidateLite[]) {
    const pillars = PILLARS;
    const priorities = new Set(priorityPillars || []);

    const results = candidates.map((cand) => {
      const cScores = cand.profileScores || {};
      let totalWeight = 0;
      let totalWeightedFocus = 0;
      const priorityAligned: string[] = [];

      for (const p of pillars) {
        const rawVal = cScores[p] as unknown;
        let candVal: number = typeof rawVal === 'number' ? rawVal : 0.5;
        if (candVal > 1.0) candVal = candVal / 100.0;

        const weight = priorities.has(p) ? 3.0 : 1.0;
        totalWeightedFocus += candVal * weight;
        totalWeight += weight;

        if (priorities.has(p) && candVal >= 0.7) {
          priorityAligned.push(p);
        }
      }

      let baseScore = (totalWeightedFocus / totalWeight) * 100.0;
      if (cand.fichaLimpa) {
        baseScore = Math.min(baseScore + 5.0, 100.0);
      }
      const score = Math.round(baseScore * 100) / 100;

      let reason = 'Alinhamento moderado';
      if (priorityAligned.length > 0) {
        reason = `Foco destacado em ${priorityAligned.length} tema(s) prioritário(s)`;
      } else if (score >= 70.0) {
        reason = 'Alto alinhamento geral nos 13 pilares';
      }

      return {
        id: cand.id,
        score,
        matchReason: reason,
        isEstimated: false,
        priorityAligned,
        candidate: {
          id: cand.id,
          tseId: cand.tseId,
          name: cand.name,
          party: cand.party,
          partyNumber: cand.partyNumber,
          photoUrl: cand.photoUrl,
          cargo: cand.cargo,
          fichaLimpa: cand.fichaLimpa,
        },
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private normalizeProfileScores(scores: Record<string, unknown> | null | undefined): Record<string, number> {
    if (!scores || typeof scores !== 'object') return {};
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(scores)) {
      const val = typeof v === 'number' ? v : 0.5;
      result[k] = val > 1.0 ? val / 100.0 : val;
    }
    return result;
  }

  static generateDeviceHash(deviceId: string): string {
    const salt = process.env.DEVICE_HASH_SALT || 'default-dev-salt-key';
    return createHash('sha256').update(`${deviceId}:${salt}`).digest('hex').slice(0, 32);
  }
}
