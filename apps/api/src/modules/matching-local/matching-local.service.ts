import { Injectable } from '@nestjs/common';
import { PILLARS } from '@np/shared';

const FICHA_LIMPA_BONUS = 5.0;
const PRIORITY_WEIGHT = 3.0;
const DEFAULT_WEIGHT = 1.0;

export interface MatchResult {
  score: number;
  reason: string;
  isEstimated: boolean;
  priorityAligned: string[];
}

@Injectable()
export class MatchingLocalService {
  public rankByPillars(
    candidate: Record<string, number> | null = null,
    priorityPillars: string[] = [],
    fichaLimpa: boolean = false,
  ): MatchResult {
    const prioritySet = new Set(priorityPillars || []);
    let isEstimated = false;
    const candidateScores = candidate || {};

    if (!candidate || Object.keys(candidate).length === 0) {
      isEstimated = true;
    }

    let totalWeightedFocus = 0.0;
    let totalWeight = 0.0;
    const priorityAligned: string[] = [];

    for (const p of PILLARS) {
      let focus = 0.5;

      if (candidateScores[p] !== undefined && candidateScores[p] !== null) {
        const cVal = Number(candidateScores[p]);
        focus = cVal > 1.0 ? cVal / 100.0 : cVal;
        if (focus < 0.0 || focus > 1.0) {
          throw new Error(`Pillar ${p} candidate score out of range: ${cVal}`);
        }
      } else {
        isEstimated = true;
      }

      const weight = prioritySet.has(p) ? PRIORITY_WEIGHT : DEFAULT_WEIGHT;
      totalWeightedFocus += focus * weight;
      totalWeight += weight;

      if (prioritySet.has(p) && focus >= 0.7) {
        priorityAligned.push(p);
      }
    }

    let score = (totalWeightedFocus / totalWeight) * 100.0;

    if (fichaLimpa) {
      score = Math.min(score + FICHA_LIMPA_BONUS, 100.0);
    }

    score = Number(score.toFixed(2));

    let reason = "Alinhamento moderado";
    if (priorityAligned.length > 0) {
      reason = `Foco destacado em ${priorityAligned.length} tema(s) prioritário(s)`;
    } else if (score >= 70.0) {
      reason = "Alto alinhamento geral nos 13 pilares";
    }

    return {
      score,
      reason,
      isEstimated,
      priorityAligned,
    };
  }

  // Alias para retrocompatibilidade
  public calculateMatch(
    candidate: Record<string, number> | null = null,
    priorityPillars: string[] = [],
    fichaLimpa: boolean = false,
  ): MatchResult {
    return this.rankByPillars(candidate, priorityPillars, fichaLimpa);
  }
}
