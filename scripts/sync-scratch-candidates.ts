import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    client
      .get(
        url,
        {
          agent: isHttps ? agent : undefined,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
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

function normalize(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function main() {
  console.log('📦 Sincronizando candidatos do arquivo scratch/candidates_to_download.json...');

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  const filePath = path.resolve(process.cwd(), 'scratch/candidates_to_download.json');
  if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado.');
    return;
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Total de itens para checagem: ${items.length}`);

  const allDb = await prisma.candidate.findMany({
    select: { id: true, tseId: true, name: true, photoUrl: true },
  });

  let downloaded = 0;

  for (const item of items) {
    if (!item.photoUrl || !item.photoUrl.startsWith('http') || item.photoUrl.includes('Replace_this_image')) {
      continue;
    }

    const normItemName = normalize(item.name);
    const matched = allDb.filter((c) => {
      if (item.tseId && c.tseId === item.tseId) return true;
      const normCand = normalize(c.name);
      return normCand === normItemName || normCand.includes(normItemName) || normItemName.includes(normCand);
    });

    if (matched.length > 0) {
      const buf = await downloadBuffer(item.photoUrl);
      if (buf) {
        for (const m of matched) {
          for (const dir of targetDirs) {
            fs.writeFileSync(path.join(dir, `${m.tseId}.jpg`), buf);
            fs.writeFileSync(path.join(dir, `tse_${m.tseId}.jpg`), buf);
          }
          if (item.tseId && item.tseId !== m.tseId) {
            for (const dir of targetDirs) {
              fs.writeFileSync(path.join(dir, `${item.tseId}.jpg`), buf);
              fs.writeFileSync(path.join(dir, `tse_${item.tseId}.jpg`), buf);
            }
          }
          await prisma.candidate.updateMany({
            where: { id: m.id },
            data: { photoUrl: item.photoUrl },
          });
          downloaded++;
        }
      }
    }
  }

  console.log(`🎉 Concluído! ${downloaded} fotos adicionais sincronizadas.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
