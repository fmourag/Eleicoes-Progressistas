import { Platform } from 'react-native';
import { CandidateClassification, GovernmentPlanDetail, CandidatePollResult, resolveCandidatePhotoUrl } from '@np/shared';

const PRODUCTION_API_URL = 'https://eleicoes-progressistas.onrender.com';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : PRODUCTION_API_URL);

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export interface Candidate {
  id: string;
  name: string;
  socialName?: string;
  viceName?: string;
  party: string;
  partyNumber?: number;
  numeroUrna?: string;
  tseId?: string;
  cargo: string;
  level?: string;
  candidaturaStatus?: 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
  dataRegistro?: string;
  fichaLimpa: boolean;
  municipality?: string;
  state?: string;
  electionYear?: number;
  photoUrl?: string;
  coalition?: string | null;
  isProgressiveSupported?: boolean;
  supportedBy?: string | null;
  governmentPlanUrl?: string;
  governmentPlanSummary?: string;
  overallCommitmentScore?: number;
  classification?: CandidateClassification;
  governmentPlan?: GovernmentPlanDetail;
}

export interface User {
  id: string;
  email: string;
  cep?: string;
  municipality?: string;
  state?: string;
}

export interface MatchingResponse {
  results: MatchResult[];
  deviceHash: string;
  computedAt: string;
  isFallback?: boolean;
  message?: string;
}

export interface CandidatesResponse {
  results?: Candidate[];
  isFallback?: boolean;
  message?: string;
}

export interface MatchResult {
  id: string;
  score: number;
  candidate: Candidate;
}

export interface ProposalItem {
  id?: string;
  pillar: string;
  title?: string;
  description?: string;
  text?: string;
  translatedText?: string;
  translationStatus?: string;
}

export interface RaioXData {
  id: string;
  candidate?: Candidate;
  name: string;
  socialName?: string;
  viceName?: string;
  party: string;
  partyNumber?: number;
  numeroUrna?: string;
  cargo: string;
  level?: string;
  state?: string;
  municipality?: string;
  electionYear?: number;
  tseId?: string;
  photoUrl?: string;
  candidaturaStatus?: 'EM_ANALISE' | 'DEFERIDO' | 'INDEFERIDO' | 'CASSADO' | 'RENUNCIA';
  fichaLimpa: boolean;
  financedBy?: { amount: number; sources: string[]; tsePrestadorUrl?: string };
  votingHistory?: { project: string; vote: string }[];
  proposals?: ProposalItem[];
  governmentPlanUrl?: string;
  governmentPlanSummary?: string;
  profileScores?: Record<string, number>;
  classification?: CandidateClassification;
  governmentPlan?: GovernmentPlanDetail;
  pollResult?: CandidatePollResult;
}

export function getCandidatePhotoUrl(
  photoUrl?: string | null,
  tseId?: string | null,
  cargo?: string | null,
  name?: string | null,
  id?: string | null
): string {
  // 1. Tenta resolver via inteligência parlamentar e TSE de @np/shared
  const resolved = resolveCandidatePhotoUrl({ photoUrl, tseId, cargo, name, id });
  if (resolved) {
    return resolved;
  }

  // 2. Se for uma URL externa
  if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
    return photoUrl.replace(/^http:\/\//i, 'https://');
  }

  // 3. Fallback para API do backend caso seja relativo
  const base = API_URL.replace(/\/+$/, '');
  if (photoUrl && photoUrl.startsWith('/')) {
    return `${base}${photoUrl}`;
  }
  if (photoUrl) {
    return `${base}/candidates/${photoUrl}`;
  }
  if (tseId) {
    return `${base}/candidates/${tseId}.jpg`;
  }
  return '';
}

export const DEFAULT_API_TIMEOUT = 60000;

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) break;
      const delay = baseDelayMs * Math.pow(2, i); // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeout ?? DEFAULT_API_TIMEOUT;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutTimer);
    const isAbort = (err as Error)?.name === 'AbortError';
    console.warn(
      `[API] ${isAbort ? 'Timeout de conexão (60s)' : 'Falha de conexão'} ao acessar ${path}:`,
      (err as Error).message
    );
    throw new Error(
      isAbort
        ? 'O servidor demorou mais que 60 segundos para responder (inicialização de serviço). Tente novamente em instantes.'
        : 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.'
    );
  } finally {
    clearTimeout(timeoutTimer);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, config?: { params?: Record<string, any>; timeout?: number }) => {
    let url = path;
    if (config?.params) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(config.params)) {
        if (v !== undefined && v !== null) sp.append(k, String(v));
      }
      const qs = sp.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return apiRequest<T>(url, { timeout: config?.timeout });
  },
  post: <T>(path: string, body?: unknown, config?: { timeout?: number }) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      timeout: config?.timeout,
    }),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ access_token: string; user: User }>('/api/auth/login', credentials),
  register: (data: { email: string; password: string; cep: string; municipality: string; state: string }) =>
    api.post<{ access_token: string; user: User }>('/api/auth/register', data),
};

export const geoApi = {
  resolveCep: (cep: string) =>
    api.get<{ municipality: string; state: string; eligibleCargos: string[] }>(`/api/geo/cep/${cep}`),
};

export interface RankMatchDto {
  priority_pillars?: string[];
  location?: { uf?: string; ibge_code?: string };
  includePending?: boolean;
}

export const matchingApi = {
  getResults: (deviceId: string, userId?: string) =>
    api.get<MatchResult[]>(`/api/candidates`),
  rank: (dto?: RankMatchDto) =>
    api.post<MatchingResponse>('/api/matching/rank', dto ?? {}),
  compute: (dto?: RankMatchDto) =>
    api.post<MatchingResponse>('/api/matching/rank', dto ?? {}),
};

const MOCK_RAIOX_FALLBACKS: Record<string, RaioXData> = {
  c1: {
    id: 'c1',
    name: 'Luiz Inácio Lula da Silva',
    socialName: 'Lula',
    viceName: 'Geraldo Alckmin',
    party: 'PT / PSB (Brasil da Esperança)',
    cargo: 'PRESIDENTE',
    level: 'FEDERAL',
    candidaturaStatus: 'DEFERIDO',
    fichaLimpa: true,
    governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
    governmentPlanSummary: 'Diretrizes do Plano de Governo: Reconstrução social e econômica do Brasil, erradicação da fome, Nova Indústria sustentável, fortalecimento do SUS, inclusão educacional via Pé-de-Meia e transição ecológica justa.',
    financedBy: { amount: 45000000, sources: ['Fundo Partidário', 'Doações Pessoas Físicas'] },
    votingHistory: [
      { project: 'PEC da Transição / Bolsa Família R$600', vote: 'Aprovado' },
      { project: 'Reforma Tributária (EC 132/2023)', vote: 'Aprovado' },
      { project: 'Nova Política de Valorização do Salário Mínimo', vote: 'Aprovado' },
    ],
    proposals: [
      { pillar: 'p1', text: 'Ampliação do Farmácia Popular e SUS com cirurgias eletivas.' },
      { pillar: 'p7', text: 'Bolsa Família com proteção integral à primeira infância.' },
      { pillar: 'p9', text: 'Fortalecimento do SUS e equipes de Saúde da Família.' },
      { pillar: 'p5', text: 'Programa Nova Indústria Brasil e transição energética verde.' },
    ],
  },
};

export const candidatesApi = {
  getAll: (params?: { municipality?: string; state?: string; cargo?: string; party?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.municipality) query.append('municipality', params.municipality);
    if (params?.state) query.append('state', params.state);
    if (params?.cargo) query.append('cargo', params.cargo);
    if (params?.party) query.append('party', params.party);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<Candidate[] | (CandidatesResponse & { results: Candidate[] })>(`/api/candidates${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<Candidate>(`/api/candidates/${id}`),
  getRaioX: async (id: string): Promise<RaioXData> => {
    try {
      return await api.get<RaioXData>(`/api/candidates/${id}/raio-x`);
    } catch (err) {
      if (MOCK_RAIOX_FALLBACKS[id]) {
        return MOCK_RAIOX_FALLBACKS[id];
      }
      return {
        id,
        name: 'Candidato(a) Progressista',
        socialName: 'Candidato Oficial',
        party: 'FE BRASIL / PSB / PSOL',
        cargo: 'PRESIDENTE',
        level: 'FEDERAL',
        candidaturaStatus: 'EM_ANALISE',
        fichaLimpa: true,
        governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
        governmentPlanSummary: 'Plano de Governo Registrado no TSE: Foco em justiça social, ampliação da rede de atenção primária de saúde, segurança cidadã e transição ecológica.',
        votingHistory: [
          { project: 'Proposta de Emenda Constitucional da Saúde', vote: 'Aprovado' },
          { project: 'Incentivo à Transição Energética e Sustentabilidade', vote: 'Aprovado' },
        ],
        proposals: [
          { pillar: 'p1', text: 'Fortalecimento de serviços públicos e direitos sociais.' },
          { pillar: 'p9', text: 'Investimentos prioritários em saúde universal e educação.' },
        ],
      };
    }
  },
  getTseDetail: (id: string) => api.get<any>(`/api/candidates/${id}/tse-detail`),
  getFinances: (id: string) => api.get<any>(`/api/candidates/${id}/finances`),
  syncTse: (candidateId?: string) => api.post<any>('/api/candidates/sync-tse', { candidateId }),
  getSourceInfo: () => api.get<any>('/api/candidates/tse/source-info'),
};

export interface WatchdogAlert {
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  cargo: string;
  voteId: string;
  externalId: string;
  house: string;
  description: string;
  summaryUrl: string;
  date: string;
  pillarId: string;
  candidateChoice: string;
  divergenceReason: string;
}

export interface WatchdogPledge {
  id: string;
  candidateId: string;
  pillar: string;
  title: string;
  description: string;
  status: 'PROPOSTA' | 'EM_ANDAMENTO' | 'CUMPRIDA' | 'QUEBRADA';
  sourceUrl?: string;
  evidenceUrl?: string;
  updatedAt: string;
}

export interface WatchdogDashboard {
  eleitosPorPilar: Record<string, number>;
  eleitosPorPartido: Record<string, number>;
  fidelidadeMedia: number;
  topDivergencias: Array<{
    description: string;
    pillarId: string;
    divergenceCount: number;
  }>;
  totalEleitos: number;
  totalVotacoes: number;
}

export const watchdogApi = {
  getAlerts: (candidateIds: string[], priorities?: string[]) => {
    const params: Record<string, string> = {
      candidateIds: candidateIds.join(','),
    };
    if (priorities && priorities.length > 0) {
      params.priorities = priorities.join(',');
    }
    return api.get<{ alerts: WatchdogAlert[]; total: number }>('/api/watchdog/alerts', { params });
  },
  getPledges: (candidateId?: string) => {
    return api.get<{ pledges: WatchdogPledge[] }>('/api/watchdog/pledges', {
      params: candidateId ? { candidateId } : undefined,
    });
  },
  getDashboard: () => {
    return api.get<WatchdogDashboard>('/api/watchdog/dashboard');
  },
  getVotes: (candidateId: string, since?: string) => {
    return api.get<any[]>('/api/watchdog/votes', {
      params: { candidateId, since },
    });
  },
};
