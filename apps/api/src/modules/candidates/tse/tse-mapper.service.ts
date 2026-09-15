import { Injectable } from '@nestjs/common';
import { Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';
import { EXCLUDED_CONSERVATIVE_PARTIES } from '@np/shared';
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
   * Verifica se o partido está na lista de exclusão
   */
  isPartyExcluded(partySigla: string): boolean {
    if (!partySigla) return false;
    const normalized = partySigla.trim().toUpperCase();
    return EXCLUDED_CONSERVATIVE_PARTIES.includes(normalized as any);
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
   * Inicializa o perfil de matching 40/30/30 com p1..p13 = 0.5 neutro
   */
  generateDefaultMatchingProfile(): Record<string, number> {
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
    const defaultProfiles = this.generateDefaultMatchingProfile();
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
    const defaultProfiles = this.generateDefaultMatchingProfile();
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
