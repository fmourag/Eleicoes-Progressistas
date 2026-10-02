/**
 * merge-tse-photos.ts — Merge cirúrgico TSE 2026: cruza o CSV oficial
 * (consulta_cand_2026, Dados Abertos) com os candidatos do banco e baixa a
 * FOTO OFICIAL DE URNA (CDN Hermes/Tribuna) somente para quem está sem foto
 * verificada. NÃO insere linhas novas (zero risco de duplicatas).
 *
 * Match ESTRITO: nome completo normalizado (NM_CANDIDATO ou NM_URNA) + UF + cargo.
 * Uso: npx tsx scripts/merge-tse-photos.ts --zip ./consulta_cand_2026.zip [--apply]
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const UA = 'EleicoesProgressistas/2.2.21 (+https://eleicoes-progressistas.pages.dev)';

const DIRS = [
  path.resolve(process.cwd(), 'apps/api/public/candidates'),
  path.resolve(process.cwd(), 'apps/api/static/candidates'),
  path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
];
for (const d of DIRS) fs.mkdirSync(d, { recursive: true });

const norm = (s?: string | null) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');

const CARGO_MAP: Record<string, string> = {
  'PRESIDENTE': 'PRESIDENTE',
  'GOVERNADOR': 'GOVERNADOR',
  'SENADOR': 'SENADOR',
  'DEPUTADO FEDERAL': 'DEPUTADO_FEDERAL',
  'DEPUTADO ESTADUAL': 'DEPUTADO_ESTADUAL',
};

function validImage(buf: Buffer): boolean {
  if (!buf || buf.length < 800) return false;
  return (buf[0] === 0xff && buf[1] === 0xd8) || (buf[0] === 0x89 && buf[1] === 0x50);
}

async function download(url: string): Promise<Buffer | null> {
  try {
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 12000, maxRedirects: 3, httpsAgent: agent, headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' }, validateStatus: () => true });
    if (r.status !== 200) return null;
    const buf = Buffer.from(r.data);
    return validImage(buf) ? buf : null;
  } catch { return null; }
}

async function urlOk(url: string): Promise<boolean> {
  // 3 tentativas com backoff: Wikimedia/Câmara limitam rajadas (429 transitório).
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 9000, maxRedirects: 3, httpsAgent: agent, headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' }, validateStatus: () => true });
      if (r.status === 200 && validImage(Buffer.from(r.data))) return true;
      if (r.status === 404 || r.status === 400) return false; // quebrado de verdade: nem tenta de novo
    } catch { /* tenta de novo */ }
    await new Promise((res) => setTimeout(res, 500));
  }
  return false;
}

// CSV latin1, separador ;, campos entre aspas
function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim());
  const split = (line: string): string[] => {
    const out: string[] = [];
    let cur = '', q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; continue; }
      if (ch === ';' && !q) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = split(lines[0]);
  return { header, rows: lines.slice(1).map(split) };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const zipArg = args[args.indexOf('--zip') + 1] || 'C:\\Users\\usuario\\AppData\\Local\\Temp\\opencode\\consulta_cand_2026.zip';
  const limitArg = args.indexOf('--limit') >= 0 ? parseInt(args[args.indexOf('--limit') + 1], 10) : 0;
  const offsetArg = args.indexOf('--offset') >= 0 ? parseInt(args[args.indexOf('--offset') + 1], 10) : 0;
  const onlyArg = args.indexOf('--only') >= 0 ? args[args.indexOf('--only') + 1].split(',').map((s) => s.trim()).filter(Boolean) : [];
  console.log(`[merge-tse] modo: ${apply ? 'APPLY' : 'DRY-RUN'}`);

  // 1. Carrega CSVs via Expand-Archive já extraído ou extrai com AdmZip? Usa powershell Expand-Archive.
  const { execSync } = require('child_process');
  const outDir = 'C:\\Users\\usuario\\AppData\\Local\\Temp\\opencode\\tsecsv';
  if (!fs.existsSync(outDir) || !fs.readdirSync(outDir).some((f) => f.endsWith('.csv'))) {
    execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipArg}' -DestinationPath '${outDir}' -Force"`);
  }
  const files = fs.readdirSync(outDir).filter((f) => f.startsWith('consulta_cand_2026_') && f.endsWith('.csv'));
  console.log(`[merge-tse] ${files.length} CSVs de UF`);
  interface TseRow { sq: string; nome: string; urna: string; uf: string; cargo: string; situacao: string; }
  const tseRows: TseRow[] = [];
  for (const f of files) {
    const txt = fs.readFileSync(path.join(outDir, f)).toString('latin1');
    const { header, rows } = parseCsv(txt);
    const i = (n: string) => header.indexOf(n);
    for (const r of rows) {
      if (r.length < header.length - 2) continue;
      tseRows.push({ sq: r[i('SQ_CANDIDATO')], nome: r[i('NM_CANDIDATO')], urna: r[i('NM_URNA_CANDIDATO')], uf: r[i('SG_UF')], cargo: r[i('DS_CARGO')], situacao: r[i('DS_SITUACAO_CANDIDATURA')] || '' });
    }
  }
  console.log(`[merge-tse] linhas TSE: ${tseRows.length}`);

  // 2. Candidatos do banco SEM foto válida (ou lista explícita --only, sem varredura)
  const cands = await prisma.candidate.findMany({ select: { id: true, tseId: true, name: true, socialName: true, cargo: true, state: true, photoUrl: true } });
  let needy: typeof cands;
  if (onlyArg.length > 0) {
    needy = cands.filter((c) => onlyArg.includes(c.tseId));
    console.log(`[merge-tse] banco: ${cands.length} | lista --only: ${needy.length}`);
  } else {
    needy = [];
    for (const c of cands) {
      if (c.photoUrl && await urlOk(c.photoUrl)) continue;
      needy.push(c);
    }
    console.log(`[merge-tse] banco: ${cands.length} | sem foto válida: ${needy.length}`);
  }

  // 3. Match estrito + download Hermes
  const manifestPath = path.resolve(process.cwd(), 'scripts/merge-tse-manifest.json');
  const manifest: Record<string, string> = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const saveManifest = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  let fixed = 0;
  const unmatched: string[] = [];
  const queue = limitArg > 0 ? needy.slice(offsetArg, offsetArg + limitArg) : needy;
  console.log(`[merge-tse] processando ${queue.length} candidatos (offset ${offsetArg})`);
  for (const c of queue) {
    // Idempotente: já aponta para o arquivo local servido e o arquivo existe
    const target = `https://eleicoes-progressistas.onrender.com/candidates/${c.tseId}.jpg`;
    if (c.photoUrl === target && fs.existsSync(path.join(DIRS[0], `${c.tseId}.jpg`))) continue;
    const wantCargo = c.cargo;
    const cands2 = tseRows.filter((t) => {
      const tc = CARGO_MAP[(t.cargo || '').toUpperCase().trim()];
      if (tc !== wantCargo) return false;
      if (t.uf !== 'BR' && t.uf !== (c.state || '')) return false;
      const nn = norm(t.nome), un = norm(t.urna);
      return nn === norm(c.name) || nn === norm(c.socialName) || un === norm(c.name) || un === norm(c.socialName);
    });
    // prefere DEFERIDO
    cands2.sort((a, b) => (/DEFERIDO/.test(b.situacao) ? 1 : 0) - (/DEFERIDO/.test(a.situacao) ? 1 : 0));
    const hit = cands2[0];
    if (!hit) { unmatched.push(`${c.tseId} | ${c.name} | ${c.cargo}/${c.state}`); continue; }
    const ufs = [(c.state || '').toLowerCase(), hit.uf.toLowerCase()].filter((v, i, a) => v && a.indexOf(v) === i);
    let buf: Buffer | null = null, usedUf = '';
    for (const uf of [...ufs, 'br']) {
      buf = await download(`https://www.tribunapr.com.br/hermes-media/eleicoes/2026/candidatos/${uf}/${hit.sq}.jpg`);
      if (buf) { usedUf = uf; break; }
    }
    if (!buf) { unmatched.push(`${c.tseId} | ${c.name} | ${c.cargo}/${c.state} (sq ${hit.sq} sem foto no CDN)`); continue; }
    const fname = `${c.tseId}.jpg`;
    if (apply) {
      for (const d of DIRS) fs.writeFileSync(path.join(d, fname), buf);
      await prisma.candidate.update({ where: { id: c.id }, data: { photoUrl: `https://eleicoes-progressistas.onrender.com/candidates/${fname}` } });
    }
    manifest[c.tseId] = `/candidates/${fname}`;
    saveManifest();
    fixed++;
    console.log(`  OK ${c.name} (${c.tseId}) <- sq ${hit.sq} [${hit.nome}/${hit.uf}, ${hit.situacao}] [${buf.length}B]`);
  }
  console.log(`[merge-tse] fotos oficiais aplicadas: ${fixed} | sem match/foto: ${unmatched.length}`);
  unmatched.forEach((u) => console.log('  FALTA ' + u));
}
main().catch((e) => { console.error('[merge-tse] ERRO:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
