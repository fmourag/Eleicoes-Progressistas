import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient();
const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

const API_CANDIDATES_DIR = path.resolve(process.cwd(), 'apps/api/public/candidates');
if (!fs.existsSync(API_CANDIDATES_DIR)) {
  fs.mkdirSync(API_CANDIDATES_DIR, { recursive: true });
}

function downloadBuffer(url: string, headers: Record<string, string> = {}): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            Referer: 'https://www.gazetadopovo.com.br/',
            ...headers,
          },
          timeout: 10000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            return downloadBuffer(redirectUrl, headers).then(resolve);
          }
          if (res.statusCode !== 200) {
            return resolve(null);
          }
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length > 800) {
              const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
              const isPng = buf[0] === 0x89 && buf[1] === 0x50;
              const isWebp = buf.slice(0, 4).toString() === 'RIFF';
              if (isJpeg || isPng || isWebp) {
                return resolve(buf);
              }
            }
            resolve(null);
          });
          res.on('error', () => resolve(null));
        }
      )
      .on('error', () => resolve(null))
      .on('timeout', () => resolve(null));
  });
}

function savePhotoToApi(tseId: string, buffer: Buffer) {
  try {
    fs.writeFileSync(path.join(API_CANDIDATES_DIR, `${tseId}.jpg`), buffer);
    fs.writeFileSync(path.join(API_CANDIDATES_DIR, `tse_${tseId}.jpg`), buffer);
  } catch (err: any) {
    console.warn(`[savePhoto] Failed writing ${tseId}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando download em massa de fotos reais dos candidatos RJ...');

  const rjCandidates = await prisma.candidate.findMany({
    where: { state: 'RJ', visible: true },
    select: {
      id: true,
      tseId: true,
      name: true,
      socialName: true,
      party: true,
      cargo: true,
      photoUrl: true,
      numeroUrna: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Total candidatos RJ a processar: ${rjCandidates.length}`);

  let alreadyHad = 0;
  let downloadedCdn = 0;
  let downloadedEstadao = 0;
  let downloadedWiki = 0;
  let stillMissing = 0;

  for (let i = 0; i < rjCandidates.length; i++) {
    const cand = rjCandidates[i];
    const tseId = cand.tseId;
    const f1 = path.join(API_CANDIDATES_DIR, `${tseId}.jpg`);

    // Se já tem arquivo válido no disco da API (>800 bytes), pula
    if (fs.existsSync(f1) && fs.statSync(f1).size > 800) {
      alreadyHad++;
      continue;
    }

    const displayName = cand.socialName || cand.name;
    let found = false;

    // 1. Tenta CDN Tribuna PR / Gazeta do Povo (TSE 2026 oficial)
    if (tseId && /^\d+$/.test(tseId)) {
      const cdnUrl = `https://www.tribunapr.com.br/hermes-media/eleicoes/2026/candidatos/rj/${tseId}.jpg`;
      const buf = await downloadBuffer(cdnUrl);
      if (buf) {
        savePhotoToApi(tseId, buf);
        await prisma.candidate.update({
          where: { id: cand.id },
          data: { photoUrl: `https://eleicoes-progressistas.onrender.com/candidates/${tseId}.jpg` },
        });
        downloadedCdn++;
        found = true;
        console.log(`[${i + 1}/${rjCandidates.length}] ✅ [CDN 2026] ${displayName} (${cand.party} - ${tseId}) [${buf.length} bytes]`);
      }
    }

    // 2. Se não achou, tenta Estadão CDN em anos anteriores (2024, 2022, 2020)
    if (!found && tseId && /^\d+$/.test(tseId)) {
      const years = ['2024', '2022', '2020'];
      for (const yr of years) {
        const estadaoUrl = `https://img.estadao.com.br/fotos/politica/eleicoes-${yr}/RJ/FRJ${tseId}_div.jpg`;
        const buf = await downloadBuffer(estadaoUrl);
        if (buf) {
          savePhotoToApi(tseId, buf);
          await prisma.candidate.update({
            where: { id: cand.id },
            data: { photoUrl: `https://eleicoes-progressistas.onrender.com/candidates/${tseId}.jpg` },
          });
          downloadedEstadao++;
          found = true;
          console.log(`[${i + 1}/${rjCandidates.length}] ✅ [Estadão ${yr}] ${displayName} (${cand.party} - ${tseId})`);
          break;
        }
      }
    }

    // 3. Se não achou, tenta Wikipédia por nome
    if (!found) {
      try {
        const encoded = encodeURIComponent(cand.name.trim());
        const wikiRes = await new Promise<any>((resolve) => {
          https.get(`https://pt.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=500`, { agent: httpsAgent }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
              try { resolve(JSON.parse(d)); } catch { resolve(null); }
            });
          }).on('error', () => resolve(null));
        });

        const pages = wikiRes?.query?.pages;
        if (pages) {
          const p = Object.values(pages)[0] as any;
          if (p?.thumbnail?.source && !p.thumbnail.source.includes('Flag') && !p.thumbnail.source.includes('Coat')) {
            const buf = await downloadBuffer(p.thumbnail.source);
            if (buf) {
              savePhotoToApi(tseId, buf);
              await prisma.candidate.update({
                where: { id: cand.id },
                data: { photoUrl: p.thumbnail.source },
              });
              downloadedWiki++;
              found = true;
              console.log(`[${i + 1}/${rjCandidates.length}] ✅ [Wikipédia] ${displayName} (${cand.party})`);
            }
          }
        }
      } catch {}
    }

    if (!found) {
      stillMissing++;
      console.log(`[${i + 1}/${rjCandidates.length}] ❌ [Não encontrada] ${displayName} (${cand.party} - ${cand.cargo} - ${tseId})`);
    }
  }

  console.log('\n=============================================');
  console.log(`🎉 Processamento de fotos RJ concluído!`);
  console.log(`  Já existiam no disco: ${alreadyHad}`);
  console.log(`  Baixadas da CDN 2026: ${downloadedCdn}`);
  console.log(`  Baixadas do Estadão: ${downloadedEstadao}`);
  console.log(`  Baixadas da Wikipédia: ${downloadedWiki}`);
  console.log(`  Ainda sem foto: ${stillMissing}`);
  console.log('=============================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
