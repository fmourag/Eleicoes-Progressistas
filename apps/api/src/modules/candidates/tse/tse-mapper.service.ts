import { Injectable } from '@nestjs/common';
import { Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';
import { EXCLUDED_CONSERVATIVE_PARTIES, normalizePartyName } from '@np/shared';
import * as crypto from 'crypto';
import {
  TseCandidateResponse,
  TseCsvCandidateRow,
  TsePrismaCandidateInput,
} from './types';
import { TSE_CONFIG } from './tse.config';

@Injectable()
export class TseMapperService {
  /**
   * Verifica se o partido está na lista de exclusão (com resiliência a diacríticos e mojibake)
   */
  isPartyExcluded(partySigla: string): boolean {
    if (!partySigla) return false;
    const rawUpper = partySigla.trim().toUpperCase();
    const normalized = normalizePartyName(partySigla);

    if ((EXCLUDED_CONSERVATIVE_PARTIES as readonly string[]).includes(rawUpper)) {
      return true;
    }
    if (
      (EXCLUDED_CONSERVATIVE_PARTIES as readonly string[]).some(
        (p) => normalizePartyName(p) === normalized
      )
    ) {
      return true;
    }
    if (
      normalized.includes('UNIAO') ||
      normalized.includes('MISSAO') ||
      normalized.includes('DEMOCRATA') ||
      normalized === 'DC' ||
      normalized === 'PRTB'
    ) {
      return true;
    }
    return false;
  }

  /**
   * Normaliza a sigla do estado
   */
  normalizeState(uf: string): string {
    const cleanUf = (uf || '').trim().toUpperCase();
    if (cleanUf === 'BR' || cleanUf === 'NACIONAL') {
      return 'BR';
    }
    return cleanUf;
  }

  /**
   * Converte código ou nome de cargo do TSE para a enum Cargo do Prisma
   */
  mapRole(codigoOrDescricao: number | string): Cargo {
    const raw = String(codigoOrDescricao).trim().toUpperCase();
    if (raw === '1' || raw.includes('PRESIDENTE')) return Cargo.PRESIDENTE;
    if (raw === '3' || raw.includes('GOVERNADOR')) return Cargo.GOVERNADOR;
    if (raw === '5' || raw.includes('SENADOR')) return Cargo.SENADOR;
    if (raw === '6' || raw.includes('DEPUTADO FEDERAL')) return Cargo.DEPUTADO_FEDERAL;
    if (raw === '7' || raw.includes('DEPUTADO ESTADUAL')) return Cargo.DEPUTADO_ESTADUAL;
    if (raw === '8' || raw.includes('DEPUTADO DISTRITAL')) return Cargo.DEPUTADO_ESTADUAL;
    return Cargo.DEPUTADO_ESTADUAL;
  }

  /**
   * Mapeia nível eleitoral
   */
  mapLevel(cargo: Cargo): ElectionLevel {
    if (cargo === Cargo.PRESIDENTE || cargo === Cargo.SENADOR || cargo === Cargo.DEPUTADO_FEDERAL) {
      return ElectionLevel.FEDERAL;
    }
    if (cargo === Cargo.GOVERNADOR || cargo === Cargo.DEPUTADO_ESTADUAL) {
      return ElectionLevel.ESTADUAL;
    }
    return ElectionLevel.MUNICIPAL;
  }

  /**
   * Mapeia status do TSE para enum CandidaturaStatus do Prisma
   */
  mapStatus(situacaoCandidato?: string): CandidaturaStatus {
    const sit = (situacaoCandidato || '').toUpperCase();
    if (sit.includes('INDEFERIDO') || sit.includes('CANCELADO') || sit.includes('INAPTO')) {
      return CandidaturaStatus.INDEFERIDO;
    }
    if (sit.includes('CASSADO')) return CandidaturaStatus.CASSADO;
    if (sit.includes('RENUNCIA')) return CandidaturaStatus.RENUNCIA;
    if (sit.includes('DEFERIDO') || sit.includes('APTO')) return CandidaturaStatus.DEFERIDO;
    return CandidaturaStatus.EM_ANALISE;
  }

  /**
   * Gera perfil de matching programático com base nas diretrizes partidárias
   * ou perfil neutro (0.5) se não houver orientação pública conhecida.
   */
  generateDefaultMatchingProfile(party?: string): Record<string, number> {
    const p = (party || '').toUpperCase().trim();
    if (['PSOL', 'UP', 'PCB', 'PSTU', 'PCO'].includes(p)) {
      return { p1: 0.96, p2: 0.98, p3: 0.92, p4: 0.94, p5: 0.93, p6: 0.98, p7: 0.99, p8: 0.90, p9: 0.98, p10: 0.95, p11: 0.98, p12: 0.99, p13: 0.88 };
    }
    if (['PT', 'PCDOB'].includes(p)) {
      return { p1: 0.94, p2: 0.95, p3: 0.90, p4: 0.92, p5: 0.91, p6: 0.95, p7: 0.96, p8: 0.88, p9: 0.95, p10: 0.88, p11: 0.96, p12: 0.97, p13: 0.92 };
    }
    if (['PSB', 'PDT'].includes(p)) {
      return { p1: 0.95, p2: 0.88, p3: 0.88, p4: 0.90, p5: 0.90, p6: 0.88, p7: 0.90, p8: 0.86, p9: 0.92, p10: 0.86, p11: 0.94, p12: 0.93, p13: 0.90 };
    }
    if (['REDE', 'PV'].includes(p)) {
      return { p1: 0.90, p2: 0.86, p3: 0.99, p4: 0.88, p5: 0.86, p6: 0.84, p7: 0.90, p8: 0.86, p9: 0.90, p10: 0.85, p11: 0.92, p12: 0.88, p13: 0.89 };
    }
    if (['AGIR', 'SOLIDARIEDADE', 'MOBILIZA'].includes(p)) {
      return { p1: 0.86, p2: 0.82, p3: 0.80, p4: 0.84, p5: 0.84, p6: 0.84, p7: 0.88, p8: 0.82, p9: 0.88, p10: 0.82, p11: 0.86, p12: 0.82, p13: 0.86 };
    }
    if (['PSD', 'CIDADANIA', 'PMB', 'MDB', 'PSDB'].includes(p)) {
      return { p1: 0.85, p2: 0.80, p3: 0.82, p4: 0.85, p5: 0.85, p6: 0.78, p7: 0.80, p8: 0.82, p9: 0.85, p10: 0.85, p11: 0.85, p12: 0.80, p13: 0.88 };
    }

    const profileScores: Record<string, number> = {};
    for (let i = 1; i <= 13; i++) {
      profileScores[`p${i}`] = 0.5;
    }
    return profileScores;
  }

  /**
   * Gera hash SHA-256 anônimo a partir do TSE ID
   */
  generateCpfHash(tseId: string): string {
    return crypto.createHash('sha256').update(`tse_cpf_${tseId}`).digest('hex');
  }

  /**
   * Extrai o número do partido a partir da sigla ou número de urna
   */
  extractPartyNumber(partyNumber?: number | string, ballotNumber?: string): number {
    if (partyNumber && !isNaN(Number(partyNumber))) {
      return Number(partyNumber);
    }
    if (ballotNumber && ballotNumber.length >= 2) {
      const prefix = parseInt(ballotNumber.substring(0, 2), 10);
      if (!isNaN(prefix)) return prefix;
    }
    return 0;
  }

  /**
   * Mapeia objeto de retorno da API TSE (candidato individual ou item de lista) para o Prisma
   */
  mapApiCandidateToPrisma(
    apiData: TseCandidateResponse,
    uf: string,
    electionYear = TSE_CONFIG.DEFAULT_ANO,
  ): TsePrismaCandidateInput {
    const tseId = String(apiData.id || apiData.tseId || '');
    const partySigla = (apiData.partido?.sigla || apiData.sgPartido || 'INDEP').toUpperCase();
    const cargo = this.mapRole(apiData.cargo?.codigo || apiData.codigoCargo || '');
    const level = this.mapLevel(cargo);
    const state = this.normalizeState(uf || apiData.ufCandidatura || 'BR');
    const ballotNumber = String(apiData.numero || '0');
    const partyNumber = this.extractPartyNumber(apiData.partido?.numero, ballotNumber);
    const defaultProfiles = this.generateDefaultMatchingProfile(partySigla);
    const municipality = apiData.localCandidatura || (state === 'BR' ? 'Brasil' : state);

    return {
      tseId,
      electionYear: Number(electionYear),
      name: apiData.nomeCompleto || apiData.nomeUrna || 'Sem Nome',
      socialName: apiData.nomeUrna || null,
      party: partySigla,
      partyNumber,
      numeroUrna: ballotNumber,
      cargo,
      level,
      candidaturaStatus: this.mapStatus(apiData.descricaoSituacao || apiData.descricaoTotalizacao),
      municipality,
      state,
      cpfHash: this.generateCpfHash(tseId),
      photoUrl: apiData.fotoUrl || null,
      coalition: apiData.nomeColigacao || apiData.composicaoColigacao || null,
      profileScores: defaultProfiles,
      rawTseData: apiData,
    };
  }

  /**
   * Mapeia linha de CSV dos Dados Abertos para o Prisma
   */
  mapCsvRowToPrisma(
    row: TseCsvCandidateRow,
    electionYear = TSE_CONFIG.DEFAULT_ANO,
  ): TsePrismaCandidateInput {
    const tseId = String(row.SQ_CANDIDATO || '');
    const partySigla = (row.SG_PARTIDO || 'INDEP').toUpperCase();
    const cargo = this.mapRole(row.CD_CARGO || row.DS_CARGO || '');
    const level = this.mapLevel(cargo);
    const state = this.normalizeState(row.SG_UF || 'BR');
    const ballotNumber = String(row.NR_CANDIDATO || '0');
    const partyNumber = this.extractPartyNumber(row.NR_PARTIDO, ballotNumber);
    const defaultProfiles = this.generateDefaultMatchingProfile(partySigla);
    const municipality = row.NM_UE || (state === 'BR' ? 'Brasil' : state);

    return {
      tseId,
      electionYear: Number(row.ANO_ELEICAO || electionYear),
      name: row.NM_CANDIDATO || row.NM_URNA_CANDIDATO || 'Sem Nome',
      socialName: row.NM_URNA_CANDIDATO || null,
      party: partySigla,
      partyNumber,
      numeroUrna: ballotNumber,
      cargo,
      level,
      candidaturaStatus: this.mapStatus(row.DS_SITUACAO_CANDIDATURA),
      municipality,
      state,
      cpfHash: this.generateCpfHash(tseId),
      photoUrl: null,
      coalition: row.DS_COMPOSICAO_COLIGACAO || null,
      profileScores: defaultProfiles,
      rawTseData: row,
    };
  }
}
