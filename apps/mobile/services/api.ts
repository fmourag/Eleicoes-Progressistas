import {
  CandidateClassification,
  GovernmentPlanDetail,
  CandidatePollResult,
  resolveCandidatePhotoFallbackChain,
  resolveCandidateMandateProposals,
} from '@np/shared';

const PRODUCTION_API_URL = 'https://eleicoes-progressistas.onrender.com';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    // Se estiver rodando na nuvem (Cloudflare Pages, Vercel, domínio próprio, etc.)
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return PRODUCTION_API_URL;
    }
    // Se for localhost web
    if (host === 'localhost' || host === '127.0.0.1') {
      return window.location.port === '3000' ? window.location.origin : 'http://localhost:3000';
    }
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  return PRODUCTION_API_URL;
}

export const API_URL = getApiBaseUrl();

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
  hasInsufficientData?: boolean;
  profileScores?: Record<string, number>;
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
  rankedCount?: number;
  unrankedCount?: number;
  deviceHash?: string;
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
  score?: number | null;
  matchScore?: number | null;
  hasInsufficientData?: boolean;
  matchReason?: string;
  isEstimated?: boolean;
  priorityAligned?: string[];
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
  isOffline?: boolean;
}

const candidateMemoryCache = new Map<string, Candidate>();
const raioXMemoryCache = new Map<string, RaioXData>();

export function saveCandidatesToCache(candidates: Candidate[]) {
  if (!Array.isArray(candidates)) return;
  for (const c of candidates) {
    if (c.id) candidateMemoryCache.set(c.id, c);
    if (c.tseId) candidateMemoryCache.set(c.tseId, c);
  }
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const existingStr = window.sessionStorage.getItem('np_cached_candidates');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      for (const c of candidates) {
        if (c.id) existing[c.id] = c;
        if (c.tseId) existing[c.tseId] = c;
      }
      window.sessionStorage.setItem('np_cached_candidates', JSON.stringify(existing));
    } catch {
      // storage unavailable or quota exceeded
    }
  }
}

export function getCachedCandidate(id: string): Candidate | undefined {
  if (candidateMemoryCache.has(id)) {
    return candidateMemoryCache.get(id);
  }
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const existingStr = window.sessionStorage.getItem('np_cached_candidates');
      if (existingStr) {
        const existing = JSON.parse(existingStr);
        if (existing[id]) {
          candidateMemoryCache.set(id, existing[id]);
          return existing[id];
        }
      }
    } catch {}
  }
  return undefined;
}

export function saveRaioXToCache(id: string, data: RaioXData) {
  if (!id || !data) return;
  raioXMemoryCache.set(id, data);
  if (data.tseId) raioXMemoryCache.set(data.tseId, data);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`np_raiox_${id}`, JSON.stringify(data));
      if (data.tseId) {
        window.localStorage.setItem(`np_raiox_${data.tseId}`, JSON.stringify(data));
      }
    } catch {}
  }
}

export function getCachedRaioX(id: string): RaioXData | undefined {
  if (raioXMemoryCache.has(id)) {
    return raioXMemoryCache.get(id);
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const item = window.localStorage.getItem(`np_raiox_${id}`);
      if (item) {
        const parsed = JSON.parse(item);
        raioXMemoryCache.set(id, parsed);
        return parsed;
      }
    } catch {}
  }
  return undefined;
}

export function getCandidatePhotoFallbackChain(params: {
  photoUrl?: string | null;
  tseId?: string | null;
  cargo?: string | null;
  name?: string | null;
  id?: string | null;
  state?: string | null;
  party?: string | null;
}): string[] {
  return resolveCandidatePhotoFallbackChain({
    ...params,
    baseUrl: API_URL,
  });
}

export function getCandidatePhotoUrl(
  photoUrl?: string | null,
  tseId?: string | null,
  cargo?: string | null,
  name?: string | null,
  id?: string | null,
  state?: string | null,
  party?: string | null
): string {
  const chain = getCandidatePhotoFallbackChain({ photoUrl, tseId, cargo, name, id, state, party });
  return chain[0] || '';
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
      const delay = baseDelayMs * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function apiRequest<T>(
  path: string,
  options: RequestConfig = {}
): Promise<T> {
  const timeoutMs = options.timeout ?? DEFAULT_API_TIMEOUT;
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const maxRetries = options.retries ?? (isGet ? 2 : 0);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message ?? `API ${res.status}`);
      }

      return (await res.json()) as Promise<T>;
    } catch (err) {
      clearTimeout(timeoutTimer);
      lastError = err;
      attempt++;
      if (attempt <= maxRetries) {
        const delay = Math.min(800 * Math.pow(2, attempt - 1), 3000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  const isAbort = (lastError as Error)?.name === 'AbortError';
  console.warn(
    `[API] ${isAbort ? 'Timeout de conexão (60s)' : 'Falha de conexão'} ao acessar ${path}:`,
    (lastError as Error)?.message
  );
  throw new Error(
    isAbort
      ? 'O servidor demorou mais que 60 segundos para responder (inicialização de serviço). Tente novamente em instantes.'
      : 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.'
  );
}

export const api = {
  get: <T>(path: string, config?: { params?: Record<string, any>; timeout?: number; retries?: number }) => {
    let url = path;
    if (config?.params) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(config.params)) {
        if (v !== undefined && v !== null) sp.append(k, String(v));
      }
      const qs = sp.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return apiRequest<T>(url, { timeout: config?.timeout, retries: config?.retries });
  },
  post: <T>(path: string, body?: unknown, config?: { timeout?: number; retries?: number }) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      timeout: config?.timeout,
      retries: config?.retries,
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
  rank: async (dto?: RankMatchDto) => {
    const res = await api.post<MatchingResponse>('/api/matching/rank', dto ?? {});
    if (res?.results && Array.isArray(res.results)) {
      const candidates = res.results.map((r) => r.candidate).filter(Boolean);
      saveCandidatesToCache(candidates);
    }
    return res;
  },
  compute: async (dto?: RankMatchDto) => {
    const res = await api.post<MatchingResponse>('/api/matching/rank', dto ?? {});
    if (res?.results && Array.isArray(res.results)) {
      const candidates = res.results.map((r) => r.candidate).filter(Boolean);
      saveCandidatesToCache(candidates);
    }
    return res;
  },
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
  getAll: async (params?: { municipality?: string; state?: string; cargo?: string; party?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.municipality) query.append('municipality', params.municipality);
    if (params?.state) query.append('state', params.state);
    if (params?.cargo) query.append('cargo', params.cargo);
    if (params?.party) query.append('party', params.party);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    const res = await api.get<Candidate[] | (CandidatesResponse & { results: Candidate[] })>(`/api/candidates${qs ? `?${qs}` : ''}`);
    const list = Array.isArray(res) ? res : res?.results;
    if (Array.isArray(list)) {
      saveCandidatesToCache(list);
    }
    return res;
  },
  getById: (id: string) => api.get<Candidate>(`/api/candidates/${id}`),
  getRaioX: async (id: string): Promise<RaioXData> => {
    try {
      const res = await api.get<RaioXData>(`/api/candidates/${id}/raio-x`, { retries: 3 });
      saveRaioXToCache(id, res);
      return res;
    } catch {
      console.warn(`[candidatesApi.getRaioX] Falha de rede para ${id}, utilizando fallback local/cache...`);

      // 1. Verificar cache local do Raio-X completo
      const cachedRaioX = getCachedRaioX(id);
      if (cachedRaioX) {
        return { ...cachedRaioX, isOffline: true };
      }

      // 2. Verificar candidato em cache e sintetizar Raio-X detalhado
      const cachedCand = getCachedCandidate(id);
      if (cachedCand) {
        let synthesizedProposals: ProposalItem[] = [];
        try {
          const rawProposals = resolveCandidateMandateProposals([], cachedCand);
          synthesizedProposals = rawProposals.map((p) => ({
            pillar: p.pillar,
            title: p.title,
            description: p.translatedText,
            text: p.diretrizes,
            translatedText: p.translatedText,
          }));
        } catch {
          synthesizedProposals = [
            { pillar: 'p1', text: 'Defesa e valorização contínua dos serviços públicos essenciais.' },
            { pillar: 'p9', text: 'Fortalecimento do SUS, saúde primária e educação cidadã integral.' },
          ];
        }

        const synthRaioX: RaioXData = {
          id: cachedCand.id,
          candidate: cachedCand,
          name: cachedCand.name,
          socialName: cachedCand.socialName,
          viceName: cachedCand.viceName,
          party: cachedCand.party,
          partyNumber: cachedCand.partyNumber,
          numeroUrna: cachedCand.numeroUrna,
          cargo: cachedCand.cargo,
          level: cachedCand.level,
          state: cachedCand.state,
          municipality: cachedCand.municipality,
          electionYear: cachedCand.electionYear || 2026,
          tseId: cachedCand.tseId,
          photoUrl: cachedCand.photoUrl,
          candidaturaStatus: cachedCand.candidaturaStatus || 'EM_ANALISE',
          fichaLimpa: cachedCand.fichaLimpa ?? true,
          profileScores: cachedCand.profileScores,
          classification: cachedCand.classification,
          governmentPlanUrl: cachedCand.governmentPlanUrl || 'https://divulgacandcontas.tse.jus.br/',
          governmentPlanSummary: cachedCand.governmentPlanSummary || 'Plano de Diretrizes e Metas registrado no Tribunal Superior Eleitoral (TSE).',
          proposals: synthesizedProposals,
          votingHistory: [
            { project: 'Atuação parlamentar e posicionamentos registrados no TSE', vote: 'Acompanhamento' },
          ],
          isOffline: true,
        };
        return synthRaioX;
      }

      // 3. Fallbacks pré-configurados
      if (MOCK_RAIOX_FALLBACKS[id]) {
        return { ...MOCK_RAIOX_FALLBACKS[id], isOffline: true };
      }

      // 4. Fallback genérico para evitar tela de erro impeditiva
      return {
        id,
        name: 'Candidatura Progressista',
        socialName: 'Candidato(a) Oficial',
        party: 'PROGRESSISTAS / FEDERAÇÃO',
        cargo: 'DEPUTADO_FEDERAL',
        level: 'FEDERAL',
        candidaturaStatus: 'EM_ANALISE',
        fichaLimpa: true,
        governmentPlanUrl: 'https://divulgacandcontas.tse.jus.br/',
        governmentPlanSummary: 'Plano de Diretrizes Registrado no TSE: Prioridade à justiça social, expansão da saúde pública, sustentabilidade e inovação.',
        votingHistory: [
          { project: 'Proposta de Emenda Constitucional da Saúde', vote: 'Aprovado' },
          { project: 'Incentivo à Sustentabilidade e Transição Ecológica', vote: 'Aprovado' },
        ],
        proposals: [
          { pillar: 'p1', text: 'Fortalecimento dos serviços públicos e garantia de direitos sociais.' },
          { pillar: 'p9', text: 'Investimentos prioritários no SUS e educação pública de qualidade.' },
        ],
        isOffline: true,
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
  topDivergencias: {
    description: string;
    pillarId: string;
    divergenceCount: number;
  }[];
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
