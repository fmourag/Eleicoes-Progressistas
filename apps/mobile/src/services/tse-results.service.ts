import { ELECTION_CONFIG, ELECTION_STATUS } from '../constants/election-night';
import { TseApiResponse, ElectionResult, NationalStats } from '../types/election-night';
import { RateLimiter } from '../utils/rate-limiter';
import { MemoryCache } from '../utils/memory-cache';
import { ColaCandidate } from '../../stores/cola.store';

export class TseResultsService {
  private static instance: TseResultsService;
  private readonly rateLimiter: RateLimiter;
  private readonly cache: MemoryCache<TseApiResponse>;

  constructor() {
    this.rateLimiter = new RateLimiter(ELECTION_CONFIG.rateLimitMs);
    this.cache = new MemoryCache<TseApiResponse>(ELECTION_CONFIG.cacheTtlMs);
  }

  public static getInstance(): TseResultsService {
    if (!TseResultsService.instance) {
      TseResultsService.instance = new TseResultsService();
    }
    return TseResultsService.instance;
  }

  public getCargoCode(cargo: string): string {
    const c = (cargo || '').toUpperCase().trim();
    if (c === 'PRESIDENTE') return ELECTION_CONFIG.cargoCodes.PRESIDENTE;
    if (c === 'GOVERNADOR') return ELECTION_CONFIG.cargoCodes.GOVERNADOR;
    if (c.includes('SENADOR')) return ELECTION_CONFIG.cargoCodes.SENADOR;
    if (c === 'DEPUTADO_FEDERAL') return ELECTION_CONFIG.cargoCodes.DEPUTADO_FEDERAL;
    if (c === 'DEPUTADO_ESTADUAL' || c === 'DEPUTADO_DISTRITAL') return ELECTION_CONFIG.cargoCodes.DEPUTADO_ESTADUAL;
    return '0001';
  }

  /**
   * Busca os dados simplificados oficiais do TSE para uma dada UF e Cargo
   */
  public async fetchByCargo(uf: string, cargoCode: string): Promise<TseApiResponse | null> {
    const cleanUf = (uf || 'br').toLowerCase().trim();
    const cleanCargo = cargoCode.padStart(4, '0');
    const cacheKey = `${cleanUf}-${cleanCargo}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Respeita rigidamente 1 req/segundo
    await this.rateLimiter.wait();

    const url = `${ELECTION_CONFIG.baseUrl}/${cleanUf}/${cleanUf}-c${cleanCargo}-e0001-r.json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EleicoesProgressistas/2.2.5 (Apoio Civico; contato: fmourag@gmail.com)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        // Cargo ainda não totalizado / arquivo não gerado pelo TSE
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as TseApiResponse;
      if (data && Array.isArray(data.cand)) {
        this.cache.set(cacheKey, data);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Cruza a cola eleitoral local do usuário com os dados do TSE
   * Zero envio ao backend: matching é 100% no dispositivo móvel
   */
  public async getResultsForCola(cola: ColaCandidate[]): Promise<Map<string, ElectionResult>> {
    const resultMap = new Map<string, ElectionResult>();
    if (!cola || cola.length === 0) {
      return resultMap;
    }

    // Agrupa candidatos por UF + Cargo para minimizar requisições ao TSE
    const groupMap = new Map<string, { uf: string; cargoCode: string; candidates: ColaCandidate[] }>();

    for (const cand of cola) {
      const isPresidente = cand.cargo?.toUpperCase() === 'PRESIDENTE';
      const uf = isPresidente ? 'br' : (cand.state || 'br').toLowerCase();
      const cargoCode = this.getCargoCode(cand.cargo);
      const groupKey = `${uf}:${cargoCode}`;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { uf, cargoCode, candidates: [] });
      }
      groupMap.get(groupKey)!.candidates.push(cand);
    }

    for (const group of groupMap.values()) {
      const tseData = await this.fetchByCargo(group.uf, group.cargoCode);

      if (!tseData || !Array.isArray(tseData.cand)) {
        for (const cand of group.candidates) {
          const idKey = cand.tseId || cand.id;
          resultMap.set(idKey, {
            tseId: idKey,
            candidateName: cand.socialName || cand.name,
            numeroUrna: cand.numeroUrna,
            party: cand.party,
            cargo: cand.cargo,
            uf: group.uf.toUpperCase(),
            status: 'APURANDO',
            votes: 0,
            percentage: 0,
            position: 0,
            totalCandidates: 0,
            totalVotesApurados: 0,
            lastUpdate: Date.now(),
          });
        }
        continue;
      }

      // Ordena por votos para extrair posição oficial
      const sortedCands = [...tseData.cand].sort((a, b) => {
        const va = typeof a.v === 'number' ? a.v : parseInt(String(a.v || 0), 10);
        const vb = typeof b.v === 'number' ? b.v : parseInt(String(b.v || 0), 10);
        return vb - va;
      });

      for (const cand of group.candidates) {
        const idKey = cand.tseId || cand.id;
        // Matching por SQ_CANDIDATO (seq === tseId), com fallback para numeroUrna
        const matchIndex = sortedCands.findIndex(
          (c) => (cand.tseId && String(c.seq) === String(cand.tseId)) || String(c.n) === String(cand.numeroUrna)
        );

        if (matchIndex >= 0) {
          const match = sortedCands[matchIndex];
          const votes = typeof match.v === 'number' ? match.v : parseInt(String(match.v || 0), 10);
          const percentage = typeof match.pv === 'number' ? match.pv : parseFloat(String(match.pv || '0').replace(',', '.'));
          const status = this.mapStatus(match.s, votes, tseData.vapt);

          resultMap.set(idKey, {
            tseId: idKey,
            candidateName: cand.socialName || cand.name || match.nm,
            numeroUrna: match.n,
            party: match.p,
            cargo: cand.cargo,
            uf: group.uf.toUpperCase(),
            status,
            votes,
            percentage,
            position: matchIndex + 1,
            totalCandidates: sortedCands.length,
            totalVotesApurados: tseData.vapt || 0,
            lastUpdate: Date.now(),
          });
        } else {
          resultMap.set(idKey, {
            tseId: idKey,
            candidateName: cand.socialName || cand.name,
            numeroUrna: cand.numeroUrna,
            party: cand.party,
            cargo: cand.cargo,
            uf: group.uf.toUpperCase(),
            status: 'APURANDO',
            votes: 0,
            percentage: 0,
            position: 0,
            totalCandidates: sortedCands.length,
            totalVotesApurados: tseData.vapt || 0,
            lastUpdate: Date.now(),
          });
        }
      }
    }

    return resultMap;
  }

  /**
   * Estatísticas Nacionais e por Estado para o Dashboard do Election Night
   */
  public async fetchNationalStats(userUf?: string): Promise<NationalStats> {
    const stats: NationalStats = {
      presidente: null,
      governadores: {},
      senadores: {},
      percentualApurado: 0,
      totalSecoes: 0,
      secoesApuradas: 0,
      lastUpdate: Date.now(),
    };

    // 1. Busca Presidente (BR)
    const brPresidente = await this.fetchByCargo('br', ELECTION_CONFIG.cargoCodes.PRESIDENTE);
    if (brPresidente && brPresidente.cand && brPresidente.cand.length > 0) {
      const leader = brPresidente.cand[0];
      const votes = typeof leader.v === 'number' ? leader.v : parseInt(String(leader.v || 0), 10);
      const percentage = typeof leader.pv === 'number' ? leader.pv : parseFloat(String(leader.pv || '0').replace(',', '.'));

      stats.presidente = {
        tseId: leader.seq,
        candidateName: leader.nm,
        numeroUrna: leader.n,
        party: leader.p,
        cargo: 'PRESIDENTE',
        uf: 'BR',
        status: this.mapStatus(leader.s, votes, brPresidente.vapt),
        votes,
        percentage,
        position: 1,
        totalCandidates: brPresidente.cand.length,
        totalVotesApurados: brPresidente.vapt || 0,
        lastUpdate: Date.now(),
      };
      stats.percentualApurado = percentage;
    }

    // 2. Busca Estados prioritários (do usuário ou primeiros)
    const targetUfs = userUf ? [userUf.toUpperCase()] : ['SP', 'RJ', 'MG', 'BA', 'RS'];

    await Promise.allSettled(
      targetUfs.map(async (uf) => {
        const govData = await this.fetchByCargo(uf, ELECTION_CONFIG.cargoCodes.GOVERNADOR);
        if (govData && govData.cand && govData.cand.length > 0) {
          const leader = govData.cand[0];
          const votes = typeof leader.v === 'number' ? leader.v : parseInt(String(leader.v || 0), 10);
          const percentage = typeof leader.pv === 'number' ? leader.pv : parseFloat(String(leader.pv || '0').replace(',', '.'));

          stats.governadores[uf] = {
            tseId: leader.seq,
            candidateName: leader.nm,
            numeroUrna: leader.n,
            party: leader.p,
            cargo: 'GOVERNADOR',
            uf,
            status: this.mapStatus(leader.s, votes, govData.vapt),
            votes,
            percentage,
            position: 1,
            totalCandidates: govData.cand.length,
            totalVotesApurados: govData.vapt || 0,
            lastUpdate: Date.now(),
          };
        }

        const senData = await this.fetchByCargo(uf, ELECTION_CONFIG.cargoCodes.SENADOR);
        if (senData && senData.cand && senData.cand.length > 0) {
          const senList: ElectionResult[] = senData.cand.slice(0, 2).map((sCand, idx) => {
            const votes = typeof sCand.v === 'number' ? sCand.v : parseInt(String(sCand.v || 0), 10);
            const percentage = typeof sCand.pv === 'number' ? sCand.pv : parseFloat(String(sCand.pv || '0').replace(',', '.'));
            return {
              tseId: sCand.seq,
              candidateName: sCand.nm,
              numeroUrna: sCand.n,
              party: sCand.p,
              cargo: 'SENADOR',
              uf,
              status: this.mapStatus(sCand.s, votes, senData.vapt),
              votes,
              percentage,
              position: idx + 1,
              totalCandidates: senData.cand.length,
              totalVotesApurados: senData.vapt || 0,
              lastUpdate: Date.now(),
            };
          });
          stats.senadores[uf] = senList;
        }
      })
    );

    return stats;
  }

  public mapStatus(s: string, votes: number, totalVotes: number): 'ELEITO' | 'SEGUNDO_TURNO' | 'NAO_ELEITO' | 'APURANDO' {
    const raw = (s || '').toUpperCase().trim();
    if (raw.includes('ELEITO') && !raw.includes('NÃO') && !raw.includes('NAO')) {
      return 'ELEITO';
    }
    if (raw.includes('2º TURNO') || raw.includes('2 TURNO') || raw.includes('SEGUNDO TURNO')) {
      return 'SEGUNDO_TURNO';
    }
    if (raw.includes('NÃO ELEITO') || raw.includes('NAO ELEITO')) {
      return 'NAO_ELEITO';
    }
    if (votes === 0 && totalVotes > 10000) {
      return 'NAO_ELEITO';
    }
    return 'APURANDO';
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const tseResultsService = TseResultsService.getInstance();
