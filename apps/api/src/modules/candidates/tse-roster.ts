import rosterData from './data/tse-roster.json';

/**
 * Filtro final de candidaturas baseado nos dados abertos do TSE
 * (consulta_cand_2026). Regerar com: node scripts/build-tse-roster.js
 *
 * Regra: um candidato só é exibido se constar no registro oficial do TSE
 * para o mesmo cargo e circunscrição (BR para Presidente, UF nos demais).
 */
interface RosterEntry {
  sq: string;
  cargo: string;
  uf: string;
  nr: string;
  party: string;
  nm: string;
  urna: string;
  social: string;
  vice?: string;
}

const norm = (s?: string | null) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const STOP = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
const tokens = (s: string) => norm(s).split(' ').filter((t) => t && !STOP.has(t));

const entries = (rosterData as unknown as { candidates: RosterEntry[] }).candidates;

const bySq = new Map<string, RosterEntry>();
const byScope = new Map<string, { entry: RosterEntry; names: string[][] }[]>();

for (const e of entries) {
  if (e.cargo === 'VICE-PRESIDENTE') continue;
  bySq.set(e.sq, e);
  const scope = `${e.cargo}|${e.cargo === 'PRESIDENTE' ? 'BR' : e.uf}`;
  const names = [e.nm, e.urna, e.social].filter(Boolean).map(tokens).filter((t) => t.length > 0);
  if (!byScope.has(scope)) byScope.set(scope, []);
  byScope.get(scope)!.push({ entry: e, names });
}

function sameName(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  if (a.join(' ') === b.join(' ')) return true;
  const [small, large] = a.length <= b.length ? [a, b] : [b, a];
  // Nome curto (ex.: "Lula") só casa por igualdade; nomes compostos casam por inclusão de tokens.
  if (small.length < 2) return false;
  return small.every((t) => large.includes(t));
}

export interface RosterProbe {
  tseId?: string | null;
  name?: string | null;
  socialName?: string | null;
  cargo?: string | null;
  state?: string | null;
  party?: string | null;
}

/** Retorna o registro TSE correspondente ou null quando o candidato não consta no TSE. */
export function findInTseRoster(c: RosterProbe): RosterEntry | null {
  if (c.tseId && /^\d+$/.test(c.tseId)) {
    const hit = bySq.get(c.tseId);
    if (hit) return hit;
  }
  const scope = `${c.cargo}|${c.cargo === 'PRESIDENTE' ? 'BR' : (c.state || '').toUpperCase()}`;
  const pool = byScope.get(scope);
  if (!pool) return null;
  const mine = [c.name, c.socialName].filter(Boolean).map((n) => tokens(n as string)).filter((t) => t.length > 0);
  for (const { entry, names } of pool) {
    if (c.party && entry.party && norm(c.party) !== norm(entry.party)) {
      // partido divergente: só aceita se o nome completo for idêntico
      if (!mine.some((m) => names.some((n) => m.join(' ') === n.join(' ')))) continue;
    }
    if (mine.some((m) => names.some((n) => sameName(m, n)))) return entry;
  }
  return null;
}

export function isInTseRoster(c: RosterProbe): boolean {
  return findInTseRoster(c) !== null;
}
