/**
 * backfill-missing-photos.ts — Restaura a estratégia da versão funcional:
 * baixa retratos VERIFICADOS (magic bytes + tamanho) para o disco e aponta
 * o banco para o arquivo servido pelo Render, em vez de hotlinks quebrados.
 *
 * Fontes por candidato (nesta ordem): Câmara bandep (dep_NNN) > Senado
 * (sen_NNN) > Wikipédia com título EXATO (nome/socialName).
 * Salva em: apps/api/public/candidates, apps/api/static/candidates,
 * apps/mobile/public/candidates (os 3 servidos por Render/Pages).
 *
 * Uso: npx tsx scripts/backfill-missing-photos.ts [--apply]
 * Sem --apply: só diagnostica (dry-run). Com --apply: baixa, salva e atualiza o banco.
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const UA = 'EleicoesProgressistas/2.2.24 (+https://eleicoes-progressistas.pages.dev)';

const DIRS = [
  path.resolve(process.cwd(), 'apps/api/public/candidates'),
  path.resolve(process.cwd(), 'apps/api/static/candidates'),
  path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
];
for (const d of DIRS) fs.mkdirSync(d, { recursive: true });

const norm = (s?: string | null) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ');

function validImage(buf: Buffer): boolean {
  if (!buf || buf.length < 800) return false;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  const isWebp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  const isGif = buf.slice(0, 3).toString() === 'GIF';
  return isJpeg || isPng || isWebp || isGif;
}

async function download(url: string): Promise<Buffer | null> {
  try {
    const r = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxRedirects: 3,
      httpsAgent: agent,
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' },
      validateStatus: () => true,
    });
    if (r.status !== 200) return null;
    const buf = Buffer.from(r.data);
    return validImage(buf) ? buf : null;
  } catch { return null; }
}

async function urlOk(url: string): Promise<boolean> {
  // Baixa o corpo (limite 64KB) — Range 0-0 não permite validar magic bytes.
  try {
    const r = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 20000,
      maxRedirects: 3,
      httpsAgent: agent,
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' },
      validateStatus: () => true,
    });
    if (r.status !== 200) return false;
    return validImage(Buffer.from(r.data));
  } catch { return false; }
}

async function wikiExactThumbnail(name: string): Promise<string | null> {
  if (norm(name).split(' ').length < 2) return null;
  try {
    const r = await axios.get('https://pt.wikipedia.org/w/api.php', {
      params: { action: 'query', titles: name.trim(), prop: 'pageimages', format: 'json', pithumbsize: '500' },
      timeout: 15000,
      httpsAgent: agent,
      headers: { 'User-Agent': UA },
      validateStatus: () => true,
    });
    const pages = r.data?.query?.pages;
    if (!pages) return null;
    const p = Object.values(pages)[0] as any;
    if (p?.missing) return null;
    if (norm(p?.title) !== norm(name)) return null; // EXATO: evita homônimo
    const src = p?.thumbnail?.source;
    if (!src || /flag|coat|brasao|replace/i.test(src)) return null;
    return src;
  } catch { return null; }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const downloadOnly = process.argv.includes('--download-only');
  const applyDb = process.argv.includes('--apply-db');
  console.log(`[backfill] modo: ${applyDb ? 'APPLY-DB (só banco, via manifest)' : downloadOnly ? 'DOWNLOAD-ONLY (só arquivos + manifest)' : apply ? 'APPLY' : 'DRY-RUN'}`);

  if (applyDb) {
    const manifestPath = path.resolve(process.cwd(), 'scripts/backfill-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, string>;
    let n = 0;
    for (const [tseId, localPath] of Object.entries(manifest)) {
      const fname = path.basename(localPath);
      const diskFile = path.join(DIRS[0], fname);
      if (!fs.existsSync(diskFile)) { console.log(`  PULA ${tseId} (arquivo ausente após curadoria)`); continue; }
      const rows = await prisma.candidate.findMany({ where: { tseId }, select: { id: true } });
      for (const r of rows) {
        await prisma.candidate.update({ where: { id: r.id }, data: { photoUrl: `https://eleicoes-progressistas.onrender.com/candidates/${fname}` } });
        n++;
      }
      console.log(`  OK banco ${tseId} <- /candidates/${fname} (${rows.length} reg)`);
    }
    console.log(`[backfill] banco atualizado: ${n} registros`);
    return;
  }
  const cands = await prisma.candidate.findMany({
    select: { id: true, tseId: true, name: true, socialName: true, cargo: true, state: true, photoUrl: true },
    orderBy: { name: 'asc' },
  });
  console.log(`[backfill] candidatos no banco: ${cands.length}`);
  const manifest: Record<string, string> = {};
  let okSkip = 0, fixed = 0;
  const stillMissing: string[] = [];

  for (const c of cands) {
    if (c.photoUrl && await urlOk(c.photoUrl)) { okSkip++; continue; }
    const display = c.socialName || c.name;
    const sources: string[] = [];
    const dep = (c.tseId || '').match(/^dep_(\d+)$/);
    if (dep) sources.push(`https://www.camara.leg.br/internet/deputado/bandep/${dep[1]}.jpg`);
    const sen = (c.tseId || '').match(/^sen_(\d+)$/);
    if (sen) sources.push(`https://www.senado.leg.br/senadores/img/fotos-oficiais/${sen[1]}.jpg`);
    // Wiki exata (nome e socialName) — resolve na hora, sem adivinhar
    for (const nm of [c.name, c.socialName]) {
      if (!nm) continue;
      const thumb = await wikiExactThumbnail(nm);
      if (thumb && !sources.includes(thumb)) sources.push(thumb);
    }
    let saved = false;
    for (const url of sources) {
      const buf = await download(url);
      if (!buf) continue;
      const fname = `${c.tseId}.jpg`;
      if (apply || downloadOnly) {
        for (const d of DIRS) fs.writeFileSync(path.join(d, fname), buf);
        if (apply) {
          const publicUrl = `https://eleicoes-progressistas.onrender.com/candidates/${fname}`;
          await prisma.candidate.update({ where: { id: c.id }, data: { photoUrl: publicUrl } });
        }
      }
      manifest[c.tseId] = `/candidates/${fname}`;
      fixed++;
      console.log(`  OK [${sources.indexOf(url) === 0 ? 'direta' : 'wiki'}] ${display} (${c.tseId}) <- ${url.slice(0, 80)} [${buf.length}B]`);
      saved = true;
      break;
    }
    if (!saved) {
      stillMissing.push(`${c.tseId} | ${display} | ${c.cargo}/${c.state}`);
      console.log(`  FALTA ${display} (${c.tseId}, ${c.cargo}/${c.state}) — sem fonte verificada`);
    }
  }
  console.log(`[backfill] ok existentes: ${okSkip} | corrigidos: ${fixed} | sem fonte: ${stillMissing.length}`);
  if (apply || downloadOnly) fs.writeFileSync(path.resolve(process.cwd(), 'scripts/backfill-manifest.json'), JSON.stringify(manifest, null, 2));
}
main().catch((e) => { console.error('[backfill] ERRO:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
