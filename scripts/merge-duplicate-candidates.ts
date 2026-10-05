/**
 * merge-duplicate-candidates.ts — Saneamento de duplicatas nome+cargo+UF.
 *
 * Origem: linhas curadas (tseId sintético, com profileScores/apoios/foto local)
 * convivendo com linhas de enriquecimento posterior (slug, sem scores, foto
 * hubpolitico). Para cada grupo: arbitra pela URNA OFICIAL do CSV
 * (consulta_cand_2026), migra campos ricos para a vencedora e exclui a outra.
 * Sem match oficial: vence a mais rica (scores > foto local > qualquer).
 *
 * Uso: npx tsx scripts/merge-duplicate-candidates.ts [--apply]
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const norm = (s?: string | null) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');

const CARGO_MAP: Record<string, string> = {
  'PRESIDENTE': 'PRESIDENTE', 'GOVERNADOR': 'GOVERNADOR', 'SENADOR': 'SENADOR',
  'DEPUTADO FEDERAL': 'DEPUTADO_FEDERAL', 'DEPUTADO ESTADUAL': 'DEPUTADO_ESTADUAL',
};

function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim());
  const split = (line: string): string[] => {
    const out: string[] = []; let cur = '', q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; continue; }
      if (ch === ';' && !q) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur); return out;
  };
  return { header: split(lines[0]), rows: lines.slice(1).map(split) };
}

const scoreCount = (s: any) => (s && typeof s === 'object' ? Object.keys(s).length : 0);
const isLocalPhoto = (u?: string | null) => !!u && (u.includes('/candidates/') && (u.includes('onrender.com') || u.startsWith('/')));
// Local verificada > hotlink externo > ausente (evita trocar urna oficial por hotlink podre)
const photoRank = (u?: string | null) => (!u ? 0 : isLocalPhoto(u) ? 2 : 1);

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`[merge-dups] modo: ${apply ? 'APPLY' : 'DRY-RUN'}`);

  // 1. Índice oficial: urna por nome+UF+cargo (prefere DEFERIDO)
  const outDir = 'C:\\Users\\usuario\\AppData\\Local\\Temp\\opencode\\tsecsv';
  const files = fs.readdirSync(outDir).filter((f) => f.startsWith('consulta_cand_2026_') && f.endsWith('.csv'));
  const official = new Map<string, { urna: string; sq: string; situacao: string }>();
  for (const f of files) {
    const { header, rows } = parseCsv(fs.readFileSync(path.join(outDir, f)).toString('latin1'));
    const ix = (n: string) => header.indexOf(n);
    for (const r of rows) {
      if (r.length < header.length - 2) continue;
      const cargo = CARGO_MAP[(r[ix('DS_CARGO')] || '').toUpperCase().trim()];
      if (!cargo) continue;
      const keys = [norm(r[ix('NM_CANDIDATO')]), norm(r[ix('NM_URNA_CANDIDATO')])].filter(Boolean);
      for (const k of new Set(keys)) {
        const key = `${k}|${cargo}|${r[ix('SG_UF')]}`;
        const prev = official.get(key);
        const sit = r[ix('DS_SITUACAO_CANDIDATURA')] || '';
        if (!prev || (/DEFERIDO/.test(sit) && !/DEFERIDO/.test(prev.situacao))) {
          official.set(key, { urna: (r[ix('NR_CANDIDATO')] || '').trim(), sq: r[ix('SQ_CANDIDATO')], situacao: sit });
        }
      }
    }
  }
  console.log(`[merge-dups] chaves oficiais: ${official.size}`);

  // 2. Grupos duplicados no banco
  const rows = await prisma.candidate.findMany({
    select: { id: true, tseId: true, name: true, socialName: true, cargo: true, state: true, party: true, numeroUrna: true, photoUrl: true, profileScores: true, supportedBy: true, coalition: true, candidaturaStatus: true },
  });
  const byKey = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = `${norm(r.socialName || r.name)}|${r.cargo}|${r.state || ''}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(r);
  }
  const groups = [...byKey.entries()].filter(([k, v]) => v.length > 1);
  console.log(`[merge-dups] total banco: ${rows.length} | grupos dup: ${groups.length}`);

  let merged = 0, deleted = 0;
  for (const [key, members] of groups) {
    const [nm, cargo, uf] = key.split('|');
    const off = official.get(key);
    // Vencedora: urna oficial; senão a mais rica
    const richness = (r: any) => scoreCount(r.profileScores) * 100 + (isLocalPhoto(r.photoUrl) ? 10 : 0) + (r.supportedBy ? 5 : 0) + (r.coalition ? 2 : 0);
    let winner: any = null;
    let decidedByOfficial = false;
    if (off) {
      const exact = members.filter((m) => (m.numeroUrna || '').trim() === off.urna);
      if (exact.length === 1) { winner = exact[0]; decidedByOfficial = true; }
    }
    if (!winner) winner = [...members].sort((a, b) => richness(b) - richness(a))[0];
    // Guarda anti-homônimo: sem urna oficial decidindo e com partidos diferentes, não exclui
    const parties = new Set(members.map((m) => (m.party || '').toUpperCase()));
    if (!decidedByOfficial && parties.size > 1) {
      console.log(`? REVIEW ${nm} [${cargo}/${uf}] partidos distintos sem urna oficial — mantidos: ${members.map((m) => `${m.tseId}(${(m.numeroUrna || '').trim()}/${m.party})`).join(', ')}`);
      continue;
    }
    const losers = members.filter((m) => m.id !== winner.id);
    console.log(`- ${nm} [${cargo}/${uf}] urna oficial=${off ? off.urna + ' (sq ' + off.sq + ')' : 'N/D'} | VENCE ${winner.tseId} (urna ${winner.numeroUrna}) <- perde ${losers.map((l) => `${l.tseId}(urna ${l.numeroUrna})`).join(', ')}`);
    if (apply) {
      // Migra campos que a vencedora não tem
      const patch: any = {};
      if (!scoreCount(winner.profileScores)) {
        const donor = losers.find((l) => scoreCount(l.profileScores));
        if (donor) patch.profileScores = donor.profileScores;
      }
      if (!winner.photoUrl) {
        const donor = losers.find((l) => l.photoUrl);
        if (donor) patch.photoUrl = donor.photoUrl;
      } else {
        // Troca hotlink externo por foto local verificada do perdedor, se melhor
        const bestLocal = losers.filter((l) => photoRank(l.photoUrl) > photoRank(winner.photoUrl))
          .sort((a, b) => photoRank(b.photoUrl) - photoRank(a.photoUrl))[0];
        if (bestLocal) patch.photoUrl = bestLocal.photoUrl;
      }
      if (!winner.supportedBy) {
        const donor = losers.find((l) => l.supportedBy);
        if (donor) patch.supportedBy = donor.supportedBy;
      }
      if (!winner.coalition) {
        const donor = losers.find((l) => l.coalition);
        if (donor) patch.coalition = donor.coalition;
      }
      if (Object.keys(patch).length > 0) {
        await prisma.candidate.update({ where: { id: winner.id }, data: patch });
        merged++;
      }
      for (const l of losers) {
        await prisma.candidate.delete({ where: { id: l.id } });
        deleted++;
      }
    }
  }
  console.log(`[merge-dups] migrados: ${merged} | excluídos: ${deleted}`);
}
main().catch((e) => { console.error('[merge-dups] ERRO:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
