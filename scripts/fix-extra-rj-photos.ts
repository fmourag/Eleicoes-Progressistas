import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

function getJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'application/json',
          },
        },
        (res) => {
          let body = '';
          res.on('data', (d) => (body += d));
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => resolve(null));
  });
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          },
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
            resolve(buf.length > 500 ? buf : null);
          });
          res.on('error', () => resolve(null));
        }
      )
      .on('error', () => resolve(null));
  });
}

async function getFileUrl(fileTitle: string): Promise<string | null> {
  const ptUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    fileTitle
  )}&prop=imageinfo&iiprop=url&format=json`;
  const ptData = await getJson(ptUrl);
  const ptPages = ptData?.query?.pages;
  if (ptPages) {
    for (const pid of Object.keys(ptPages)) {
      const src = ptPages[pid]?.imageinfo?.[0]?.url;
      if (src) return src;
    }
  }
  return null;
}

async function main() {
  const titles = [
    { tseId: '190002539827', title: 'Ficheiro:FOTO PAULA FALCÃO 2026.jpg' },
    { tseId: '190002548590', title: 'Ficheiro:2024 BENEVIDES CAMELO CANDIDATO VICE-PREFEITO RJ RIO DE JANEIRO TSE (190002135107).jpg' },
    { tseId: '190002552521', title: 'Ficheiro:Luiz Eugênio em 2022.jpg' },
  ];

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  for (const item of titles) {
    const url = await getFileUrl(item.title);
    console.log(`Title ${item.title} -> URL: ${url}`);
    if (url) {
      const buf = await downloadBuffer(url);
      if (buf) {
        for (const dir of targetDirs) {
          fs.writeFileSync(path.join(dir, `${item.tseId}.jpg`), buf);
          fs.writeFileSync(path.join(dir, `tse_${item.tseId}.jpg`), buf);
        }
        await prisma.candidate.updateMany({
          where: { tseId: item.tseId },
          data: { photoUrl: url },
        });
        console.log(`✅ Salvo com sucesso para ${item.tseId} (${buf.length} bytes)`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
