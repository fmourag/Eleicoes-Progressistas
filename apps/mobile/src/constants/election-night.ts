export const ELECTION_CONFIG = {
  electionId: '2045202026',
  year: 2026,
  baseUrl: 'https://resultados.tse.jus.br/oficial/ele2026/2045202026/dados-simplificados',
  cargoCodes: {
    PRESIDENTE: '0001',
    GOVERNADOR: '0003',
    SENADOR: '0005',
    DEPUTADO_FEDERAL: '0006',
    DEPUTADO_ESTADUAL: '0007',
  } as const,
  pollingIntervals: { foregroundMs: 30_000, backgroundMs: 300_000 },
  cacheTtlMs: 60_000,
  rateLimitMs: 1000,
  activePeriods: [
    { start: '2026-10-04T18:00:00-03:00', end: '2026-10-07T00:00:00-03:00' }, // 1º turno
    { start: '2026-10-25T18:00:00-03:00', end: '2026-10-28T00:00:00-03:00' }, // 2º turno
  ],
};

export const ELECTION_STATUS = {
  APURANDO: 'APURANDO',
  ELEITO: 'ELEITO',
  SEGUNDO_TURNO: 'SEGUNDO_TURNO',
  NAO_ELEITO: 'NAO_ELEITO',
  SEM_DADOS: 'SEM_DADOS',
} as const;

export type ElectionStatusType = keyof typeof ELECTION_STATUS;
