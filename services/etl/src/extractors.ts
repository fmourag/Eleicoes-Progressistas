import axios from 'axios';
import { parse } from 'csv-parse/sync';
import pino from 'pino';
import { config, type ExtractedCandidate, type TSECandidate, type TSEProposal } from './config.js';

const log = pino({ level: config.logLevel });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Retry wrapper ────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, label: string, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
      log.warn({ label, attempt, delay, error: (err as Error).message }, 'retry');
      if (attempt === retries) throw err;
      await sleep(delay);
    }
  }
  throw new Error('unreachable');
}

// ─── Extract Candidates from DivulgaCandContas ────────
export async function fetchCandidates(year: number, uf: string, cargoCode: number): Promise<ExtractedCandidate[]> {
  const url = `${config.tse.divulgaUrl}/candidatura/listar/${year}/${uf}/${cargoCode}/candidatos`;

  const data = await withRetry(async () => {
    const res = await axios.get(url, { timeout: 30000 });
    return res.data as { dados: TSECandidate[] };
  }, `fetch_candidates_${uf}_${cargoCode}`);

  await sleep(config.delayMs);

  return (data.dados ?? []).map((c) => ({
    tseId: String(c.sqCandidato),
    name: c.nmCandidato ?? '',
    socialName: c.nmUrnaCandidato || null,
    cpf: c.cpfCandidato ?? '',
    cargoCode: c.cargo?.codigo ?? cargoCode,
    cargoName: c.cargo?.nome ?? '',
    partyNumber: c.partido?.numero ?? 0,
    partySigla: c.partido?.sigla ?? '',
    municipality: c.descricaoUe ?? '',
    state: c.siglaUe ?? uf,
    situacao: c.descricaoSituacao ?? '',
    photoUrl: c.foto ?? null,
  }));
}

// ─── Extract Proposals ────────────────────────────────
export async function fetchProposals(year: number, candidateTseId: string): Promise<TSEProposal[]> {
  const url = `${config.tse.divulgaUrl}/prestador/consulta_propaganda/${year}/13/${candidateTseId}`;

  try {
    const data = await withRetry(async () => {
      const res = await axios.get(url, { timeout: 15000 });
      return res.data;
    }, `fetch_proposals_${candidateTseId}`);

    await sleep(config.delayMs);

    const items = data?.tipoPropaganda
      ? [data]
      : Array.isArray(data?.dados)
        ? data.dados
        : [];

    return items.map((p: any) => ({
      sqPropaganda: p.sqPropaganda ?? 0,
      tituloPropaganda: p.tituloPropaganda ?? '',
      textoPropaganda: p.textoPropaganda ?? '',
      tipoPropaganda: p.tipoPropaganda ?? '',
    }));
  } catch (err) {
    log.debug({ candidateTseId }, 'no proposals found');
    return [];
  }
}

// ─── Extract from CSV (fallback) ──────────────────────
export function parseCsvContent(csvContent: string): ExtractedCandidate[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  return records.map((r: any) => ({
    tseId: r.SQ_CANDIDATO ?? r.sq_candidato ?? '',
    name: r.NM_CANDIDATO ?? r.nm_candidato ?? '',
    socialName: r.NM_URNA_CANDIDATO ?? r.nm_urna_candidato ?? null,
    cpf: r.CPF_CANDIDATO ?? r.cpf_candidato ?? '',
    cargoCode: parseInt(r.CD_CARGO ?? r.cd_cargo ?? '0', 10),
    cargoName: r.DS_CARGO ?? r.ds_cargo ?? '',
    partyNumber: parseInt(r.NUMERO_PARTIDO ?? r.numero_partido ?? '0', 10),
    partySigla: r.SIGLA_PARTIDO ?? r.sigla_partido ?? '',
    municipality: r.DESCRICAO_UE ?? r.descricao_ue ?? '',
    state: r.SIGLA_UF ?? r.sigla_uf ?? '',
    situacao: r.DESCRICAO_SITUACAO ?? r.descricao_situacao ?? '',
    photoUrl: null,
  }));
}

// ─── Batch extract all UFs × Cargos ──────────────────
export async function extractAllCandidates(): Promise<ExtractedCandidate[]> {
  const results: ExtractedCandidate[] = [];
  const cargosMunicipal = [8, 11, 14];
  const cargosEstadual = [3, 5, 7, 13];
  const cargosFederal = [1, 6, 12];
  const allCargos = [...cargosMunicipal, ...cargosEstadual, ...cargosFederal];

  for (const uf of config.ufs) {
    for (const cargo of allCargos) {
      try {
        const candidates = await fetchCandidates(config.year, uf, cargo);
        log.info({ uf, cargo, count: candidates.length }, 'extracted candidates');
        results.push(...candidates);
      } catch (err) {
        log.error({ uf, cargo, error: (err as Error).message }, 'failed to extract');
      }
    }
  }

  return results;
}
