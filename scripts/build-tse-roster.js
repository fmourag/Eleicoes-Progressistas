/**
 * Gera o "roster" oficial do TSE (filtro final de candidaturas).
 * Fonte: tmp/extracted/consulta_cand_2026_BRASIL.csv (dadosabertos.tse.jus.br)
 * Saída: apps/api/src/modules/candidates/data/tse-roster.json
 *
 * Uso: node scripts/build-tse-roster.js [caminho.csv]
 */
const fs = require('fs');
const path = require('path');

const src = process.argv[2] || path.join(__dirname, '..', 'tmp', 'extracted', 'consulta_cand_2026_BRASIL.csv');
const out = path.join(__dirname, '..', 'apps', 'api', 'src', 'modules', 'candidates', 'data', 'tse-roster.json');

const text = fs.readFileSync(src, 'latin1');

// Parser CSV (; e aspas, aceita quebras de linha dentro de aspas)
function parse(t) {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ';') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const rows = parse(text);
const header = rows[0];
const ix = (n) => header.indexOf(n);
const I = {
  uf: ix('SG_UF'), cargo: ix('DS_CARGO'), sq: ix('SQ_CANDIDATO'), nr: ix('NR_CANDIDATO'),
  nm: ix('NM_CANDIDATO'), urna: ix('NM_URNA_CANDIDATO'), social: ix('NM_SOCIAL_CANDIDATO'),
  sit: ix('DS_SITUACAO_CANDIDATURA'), party: ix('SG_PARTIDO'), col: ix('SQ_COLIGACAO'), mun: ix('NM_UE'),
};

const CARGOS = {
  'PRESIDENTE': 'PRESIDENTE', 'VICE-PRESIDENTE': 'VICE-PRESIDENTE',
  'GOVERNADOR': 'GOVERNADOR', 'SENADOR': 'SENADOR',
  'DEPUTADO FEDERAL': 'DEPUTADO_FEDERAL', 'DEPUTADO ESTADUAL': 'DEPUTADO_ESTADUAL', 'DEPUTADO DISTRITAL': 'DEPUTADO_ESTADUAL',
};
const fix = (s) => (s || '').replace(/^#NULO$|^#NE$/, '').trim();

const roster = [];
for (let r = 1; r < rows.length; r++) {
  const c = rows[r];
  if (c.length < 20) continue;
  const cargo = CARGOS[c[I.cargo]];
  if (!cargo) continue;
  roster.push({
    sq: c[I.sq], cargo, uf: c[I.uf], nr: c[I.nr], party: c[I.party], sit: c[I.sit],
    nm: fix(c[I.nm]), urna: fix(c[I.urna]), social: fix(c[I.social]), col: c[I.col],
  });
}
for (const p of roster.filter((x) => x.cargo === 'PRESIDENTE')) {
  const v = roster.find((x) => x.cargo === 'VICE-PRESIDENTE' && x.col === p.col);
  if (v) p.vice = v.urna || v.nm;
}
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'dadosabertos.tse.jus.br', count: roster.length, candidates: roster }));
console.log('Roster gerado:', roster.length, 'registros ->', out);
const pres = roster.filter((x) => x.cargo === 'PRESIDENTE');
const vices = roster.filter((x) => x.cargo === 'VICE-PRESIDENTE');
for (const p of pres) {
  const v = vices.find((x) => x.col === p.col);
  console.log(`${p.sq} | ${p.party} ${p.nr} | ${p.nm} (${p.urna}) | ${p.sit} | vice: ${v ? v.nm + ' (' + v.urna + ')' : '?'}`);
}
console.log('Situações:', [...new Set(roster.map((x) => x.sit))].join(' | '));
