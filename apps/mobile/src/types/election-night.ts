export interface TseApiResponse {
  cdabr: string;       // "BR" ou UF
  cdc: string;         // código do cargo
  dht: string;         // horário da totalização
  dvg: { cd: number; nm: string; p: string }[]; // partidos
  cand: {
    seq: string;       // SQ_CANDIDATO (chave primária - cruza com nosso tseId)
    n: string;         // número urna
    nm: string;        // nome urna
    p: string;         // sigla partido
    c: number;         // situação
    dv: number;        // status detalhado
    v: number;         // votos
    pv: number;        // % votos
    s: string;         // "ELEITO" | "2º TURNO" | "NÃO ELEITO" | ""
    sit: string;       // situação textual
  }[];
  vapt: number;        // votos apurados total
  e: string;           // eleição
  t: string;           // turno
}

export interface ElectionResult {
  tseId: string;
  candidateName?: string;
  numeroUrna?: string;
  party?: string;
  cargo?: string;
  uf?: string;
  status: 'ELEITO' | 'SEGUNDO_TURNO' | 'NAO_ELEITO' | 'APURANDO';
  votes: number;
  percentage: number;
  position: number;
  totalCandidates: number;
  totalVotesApurados: number;
  lastUpdate: number;
}

export interface NationalStats {
  presidente: ElectionResult | null;
  governadores: Record<string, ElectionResult>; // UF -> eleito
  senadores: Record<string, ElectionResult[]>;   // UF -> até 2 eleitos
  percentualApurado: number;
  totalSecoes: number;
  secoesApuradas: number;
  lastUpdate: number;
}

export interface PollingPreferences {
  enabled: boolean;
  notifications: boolean;
}
