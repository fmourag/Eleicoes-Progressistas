import { Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';

export interface TseSyncOptions {
  ufs?: string[];
  cargos?: Array<{ codigo: number; nome: string }>;
  ano?: number;
  eleicaoId?: string;
  downloadPhotos?: boolean;
  fetchDetails?: boolean;
  dryRun?: boolean;
}

export interface TseSyncResult {
  totalProcessed: number;
  totalImported: number;
  totalUpdated: number;
  totalExcluded: number;
  totalErrors: number;
  startedAt: string;
  completedAt: string;
  status: 'success' | 'failed' | 'partial';
  source: 'api' | 'csv' | 'photos';
  errors: Array<{ tseId?: string; name?: string; uf?: string; error: string }>;
  processed?: number;
  downloaded?: number;
  failed?: number;
}

export interface TseSyncStats {
  totalCandidates: number;
  lastSyncDate: string | null;
  lastSyncStatus: string;
  byParty: Record<string, number>;
  byRole: Record<string, number>;
  byState: Record<string, number>;
}

export interface TseCandidateItem {
  id: number | string;
  nomeUrna: string;
  numero: number | string;
  fotoUrl?: string;
  partido?: {
    sigla: string;
    nome: string;
  };
  cargo?: {
    codigo: number;
    nome: string;
  };
  [key: string]: any;
}

export interface TseCandidateListResponse {
  candidatos: TseCandidateItem[];
  [key: string]: any;
}

export interface TseCandidateResponse {
  id: number | string;
  tseId?: string;
  nomeUrna?: string;
  nomeCompleto?: string;
  numero?: number | string;
  cargo?: {
    codigo: number;
    nome: string;
  };
  codigoCargo?: number;
  partido?: {
    sigla: string;
    numero?: number;
    nome?: string;
  };
  sgPartido?: string;
  ufCandidatura?: string;
  localCandidatura?: string;
  fotoUrl?: string;
  nomeColigacao?: string;
  composicaoColigacao?: string;
  descricaoSituacao?: string;
  descricaoTotalizacao?: string;
  descricaoSexo?: string;
  grauInstrucao?: string;
  ocupacao?: string;
  numeroProcesso?: string;
  redesSociais?: Array<{ url: string }>;
  [key: string]: any;
}

export interface TseCsvCandidateRow {
  SQ_CANDIDATO: string;
  ANO_ELEICAO: string;
  NM_CANDIDATO: string;
  NM_URNA_CANDIDATO: string;
  NR_CANDIDATO: string;
  SG_PARTIDO: string;
  NR_PARTIDO?: string;
  CD_CARGO: string;
  DS_CARGO: string;
  SG_UF: string;
  NM_UE: string;
  DS_COMPOSICAO_COLIGACAO: string;
  DS_SITUACAO_CANDIDATURA: string;
  DS_GENERO?: string;
  DS_GRAU_INSTRUCAO?: string;
  DS_OCUPACAO?: string;
  NR_PROCESSO?: string;
  [key: string]: any;
}

export interface TsePrismaCandidateInput {
  tseId: string;
  electionYear: number;
  name: string;
  socialName?: string | null;
  viceName?: string | null;
  party: string;
  partyNumber: number;
  numeroUrna?: string | null;
  cargo: Cargo;
  level: ElectionLevel;
  candidaturaStatus: CandidaturaStatus;
  municipality: string;
  state: string;
  cpfHash: string;
  photoUrl?: string | null;
  coalition?: string | null;
  profileScores: Record<string, number>;
  rawTseData?: any;
}
