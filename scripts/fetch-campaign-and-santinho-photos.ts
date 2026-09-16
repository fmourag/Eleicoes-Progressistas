import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const TARGET_DIRS = [
  path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
  path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
  path.resolve(process.cwd(), 'apps/api/public/candidates'),
];

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          timeout: 15000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return downloadBuffer(res.headers.location).then(resolve);
          }
          if (res.statusCode !== 200) {
            return resolve(null);
          }
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            // Verify image magic bytes (JPEG, PNG, WEBP)
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

function savePhoto(tseId: string, buffer: Buffer) {
  for (const dir of TARGET_DIRS) {
    try {
      fs.writeFileSync(path.join(dir, `${tseId}.jpg`), buffer);
      fs.writeFileSync(path.join(dir, `tse_${tseId}.jpg`), buffer);
    } catch (err: any) {
      console.warn(`[savePhoto] Failed writing ${tseId} to ${dir}:`, err.message);
    }
  }
}

async function fetchCandidatePageImage(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 10000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return fetchCandidatePageImage(res.headers.location).then(resolve);
          }
          if (res.statusCode !== 200) return resolve(null);
          let html = '';
          res.on('data', (c) => (html += c));
          res.on('end', () => {
            // Find og:image or candidate image
            const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
            if (ogMatch && ogMatch[1] && !ogMatch[1].includes('logo') && !ogMatch[1].includes('favicon') && !ogMatch[1].includes('meta-image')) {
              return resolve(ogMatch[1]);
            }
            const imgMatch = html.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
            if (imgMatch) {
              const candidateImg = imgMatch.find((img) => !img.includes('logo') && !img.includes('icon') && !img.includes('ad') && (img.includes('foto') || img.includes('candidato') || img.includes('perfil') || img.includes('FRJ')));
              if (candidateImg) return resolve(candidateImg);
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

async function testPortals() {
  console.log('🔍 Testando obtenção de imagens de candidatos, santinhos e materiais de campanha...');

  const candidatesToEnrich = [
    { tseId: '190002538441', name: 'Pratinha', number: '4090', state: 'RJ', cargo: 'deputado-federal' },
    { tseId: '190002554118', name: 'Toninho Bondade', number: '1225', state: 'RJ', cargo: 'deputado-federal' },
    { tseId: '190002543066', name: 'Dr. Lobão', number: '1344', state: 'RJ', cargo: 'deputado-federal' },
  ];

  for (const cand of candidatesToEnrich) {
    console.log(`\nBuscando foto para: ${cand.name} (${cand.number}) [TSE: ${cand.tseId}]`);
    const gazetaSlug = cand.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const urls = [
      `https://www.gazetadopovo.com.br/eleicoes/2022/${cand.state.toLowerCase()}/${gazetaSlug}-${cand.cargo}-${cand.number}/`,
      `https://www.estadao.com.br/politica/eleicoes/2022/candidatos/${cand.state.toLowerCase()}/${cand.cargo}/${gazetaSlug}/${cand.number}/`,
    ];

    for (const url of urls) {
      console.log(`  Tentando URL: ${url}`);
      const imgUrl = await fetchCandidatePageImage(url);
      if (imgUrl) {
        console.log(`  🎯 Imagem encontrada: ${imgUrl}`);
        const buf = await downloadBuffer(imgUrl);
        if (buf) {
          savePhoto(cand.tseId, buf);
          console.log(`  ✅ Salvo foto para ${cand.tseId} (tamanho: ${buf.length} bytes)`);
          break;
        }
      }
    }
  }
}

testPortals().finally(() => prisma.$disconnect());
