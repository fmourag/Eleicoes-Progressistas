import { createHash } from 'node:crypto';
import {
  config,
  type ExtractedCandidate,
  type TransformedCandidate,
  TSE_CARGO_MAP,
  TSE_LEVEL_MAP,
  FICHA_LIMPA_EXCLUSIONS,
  PARTY_NORMALIZE,
} from './config.js';
import pino from 'pino';

const log = pino({ level: config.logLevel });

const CPF_SALT = process.env.CPF_SALT ?? 'eleicoes-progressistas-2024';

function sha256(value: string): string {
  return createHash('sha256').update(`${value}:${CPF_SALT}`).digest('hex');
}

function normalizeParty(sigla: string): string {
  const upper = sigla.toUpperCase().trim();
  return PARTY_NORMALIZE[upper] ?? upper;
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function isFichaLimpa(situacao: string): boolean {
  const upper = situacao.toUpperCase();
  for (const exclusion of FICHA_LIMPA_EXCLUSIONS) {
    if (upper.includes(exclusion)) return false;
  }
  return true;
}

export function mapCandidaturaStatus(situacaoTSE: string): 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA' {
  if (!situacaoTSE) return 'EM_ANALISE';
  const upper = situacaoTSE.toUpperCase().trim();

  if (upper.includes('AGUARDANDO') || upper.includes('ANALISE') || upper.includes('ANÁLISE') || upper.includes('PROTOCOLADO')) {
    return 'EM_ANALISE';
  }
  if (upper.includes('DEFERIDO') || upper.includes('APROVADO') || upper.includes('ELEITO')) {
    return 'DEFERIDO';
  }
  if (upper.includes('INDEFERIDO') || upper.includes('REJEITADO')) {
    return 'INDEFERIDO';
  }
  if (upper.includes('CASSADO') || upper.includes('INIDÔNEO') || upper.includes('SUSPENSO')) {
    return 'CASSADO';
  }
  if (upper.includes('RENÚNCIA') || upper.includes('RENUNCIA') || upper.includes('DESISTENTE')) {
    return 'RENUNCIA';
  }

  return 'EM_ANALISE';
}

export function transformCandidate(raw: ExtractedCandidate): TransformedCandidate | null {
  if (!raw.tseId || !raw.name || !raw.cargoCode) {
    log.debug({ tseId: raw.tseId }, 'skipping: missing required fields');
    return null;
  }

  const cargo = TSE_CARGO_MAP[raw.cargoCode];
  if (!cargo) {
    log.debug({ tseId: raw.tseId, cargoCode: raw.cargoCode }, 'skipping: unknown cargo code');
    return null;
  }

  const level = TSE_LEVEL_MAP[raw.cargoCode];
  if (!level) {
    log.debug({ tseId: raw.tseId }, 'skipping: unknown level');
    return null;
  }

  const party = normalizeParty(raw.partySigla);
  const cpf = cleanCpf(raw.cpf);

  return {
    tseId: raw.tseId,
    name: normalizeName(raw.name),
    socialName: raw.socialName ? normalizeName(raw.socialName) : null,
    cpfHash: cpf.length === 11 ? sha256(cpf) : sha256(raw.tseId),
    party,
    partyNumber: raw.partyNumber,
    cargo,
    level,
    candidaturaStatus: mapCandidaturaStatus(raw.situacao),
    dataRegistro: new Date(),
    municipality: normalizeName(raw.municipality),
    state: raw.state.toUpperCase().trim(),
    fichaLimpa: isFichaLimpa(raw.situacao),
    photoUrl: raw.photoUrl,
  };
}

export function transformAll(raw: ExtractedCandidate[]): {
  candidates: TransformedCandidate[];
  skipped: number;
  errors: number;
} {
  const candidates: TransformedCandidate[] = [];
  let skipped = 0;
  let errors = 0;

  for (const item of raw) {
    try {
      const transformed = transformCandidate(item);
      if (transformed) {
        candidates.push(transformed);
      } else {
        skipped++;
      }
    } catch (err) {
      log.error({ tseId: item.tseId, error: (err as Error).message }, 'transform error');
      errors++;
    }
  }

  log.info(
    { total: raw.length, valid: candidates.length, skipped, errors },
    'transform complete',
  );

  return { candidates, skipped, errors };
}
