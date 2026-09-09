import 'dotenv/config';

function env(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined) throw new Error(`Missing env: ${key}`);
  return val;
}

export const config = {
  db: env('DATABASE_URL'),
  tse: {
    divulgaUrl: env('TSE_DIVULGA_URL', 'https://divulgacaocontas.tse.jus.br/divulga/rest/v1'),
    repositorioUrl: env('TSE_REPOSITORIO_URL', 'https://cdn.tse.jus.br/estatistica/sead/odsele'),
    resultadosUrl: env('TSE_RESULTADOS_URL', 'https://resultados.tse.jus.br/oficial'),
  },
  year: parseInt(env('TSE_YEAR', env('ETL_YEAR', '2026')), 10),
  ufs: env('ETL_UFS', 'SP,RJ,MG,BA,RS,PE,CE,PR,SC,PA').split(','),
  delayMs: parseInt(env('ETL_DELAY_MS', '500'), 10),
  batchSize: parseInt(env('ETL_BATCH_SIZE', '100'), 10),
  logLevel: env('LOG_LEVEL', 'info'),
} as const;

// ─── TSE Cargo Code → Prisma Cargo Enum ──────────────
export const TSE_CARGO_MAP: Record<number, string> = {
  1: 'PRESIDENTE',
  3: 'GOVERNADOR',
  5: 'SENADOR',
  6: 'DEPUTADO_FEDERAL',
  7: 'DEPUTADO_ESTADUAL',
  8: 'PREFEITO',
  11: 'VEREADOR',
  12: 'VICE_PRESIDENTE',
  13: 'VICE_GOVERNADOR',
  14: 'VICE_PREFEITO',
};

// ─── TSE Cargo Code → ElectionLevel ──────────────────
export const TSE_LEVEL_MAP: Record<number, string> = {
  1: 'FEDERAL',
  3: 'ESTADUAL',
  5: 'ESTADUAL',
  6: 'FEDERAL',
  7: 'ESTADUAL',
  8: 'MUNICIPAL',
  11: 'MUNICIPAL',
  12: 'FEDERAL',
  13: 'ESTADUAL',
  14: 'MUNICIPAL',
};

// ─── TSE Situação → fichaLimpa ───────────────────────
// Desistentes, indeferidos, renúncias → false
// Registrado, deferido, eleito → true (se não tiver inelegibilidade)
export const FICHA_LIMPA_EXCLUSIONS = new Set([
  'INDEFERIDO',
  'RENÚNCIA',
  'DESISTENTE',
  'CASSADO',
  'INIDÔNEO',
  'SUSPENSO',
]);

// ─── Partido Normalization ────────────────────────────
export const PARTY_NORMALIZE: Record<string, string> = {
  'PTDO B': 'AVANTE',
  'PT do B': 'AVANTE',
  'SOLIDARIEDADE': 'CIDADANIA',
  'PRB': 'REPUBLICANOS',
  'PPS': 'CIDADANIA',
  'PEN': 'PATRIOTA',
  'PHS': 'MDB',
  'PTC': 'AGIR',
  'PTB': 'PL',
  'PODEMOS': 'PODEMOS',
  'REDE': 'REDE',
  'NOVO': 'NOVO',
  'PRTB': 'PL',
};

// ─── TSE DivulgaCandContas JSON Response Types ───────
export interface TSECandidateResponse {
  dados: TSECandidate[];
}

export interface TSECandidate {
  sqCandidato: number;
  nmCandidato: string;
  nmUrnaCandidato: string;
  cpfCandidato: string;
  cargo: { codigo: number; nome: string };
  partido: { numero: number; sigla: string; nome: string };
  descricaoSituacao: string;
  descricaoUe: string;
  siglaUe: string;
  foto?: string;
  descricaoSituacaoTurno?: string;
  seqHistorico?: number;
}

export interface TSEProposal {
  sqPropaganda: number;
  tituloPropaganda: string;
  textoPropaganda: string;
  tipoPropaganda: string;
}

// ─── Internal ETL Types ───────────────────────────────
export interface ExtractedCandidate {
  tseId: string;
  name: string;
  socialName: string | null;
  cpf: string;
  cargoCode: number;
  cargoName: string;
  partyNumber: number;
  partySigla: string;
  municipality: string;
  state: string;
  situacao: string;
  photoUrl: string | null;
}

export interface TransformedCandidate {
  tseId: string;
  name: string;
  socialName: string | null;
  cpfHash: string;
  party: string;
  partyNumber: number;
  cargo: string;
  level: string;
  candidaturaStatus: 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
  dataRegistro: Date;
  municipality: string;
  state: string;
  fichaLimpa: boolean;
  photoUrl: string | null;
}
