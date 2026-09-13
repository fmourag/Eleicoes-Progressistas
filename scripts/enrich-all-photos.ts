import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full photo enrichment...');

  // 1. Juliete Pantoja
  await prisma.candidate.updateMany({
    where: { tseId: 'gov_rj_juliete' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg' }
  });
  console.log('Enriched Juliete Pantoja');

  // 2. Load and apply resolved photos from scratch/resolved_photos.json
  const resolvedPath = path.resolve(process.cwd(), '..', '..', 'scratch', 'resolved_photos.json');
  if (fs.existsSync(resolvedPath)) {
    const resolved = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    for (const item of resolved) {
      if (item.tseId && item.photoUrl) {
        await prisma.candidate.updateMany({
          where: { tseId: item.tseId },
          data: { photoUrl: item.photoUrl }
        });
        console.log(`Enriched ${item.name} (${item.source}) -> ${item.photoUrl}`);
      }
    }
  }

  // 3. Load and apply local matched files from scratch/local_matched.json
  const localMatchedPath = path.resolve(process.cwd(), '..', '..', 'scratch', 'local_matched.json');
  if (fs.existsSync(localMatchedPath)) {
    const localMatched = JSON.parse(fs.readFileSync(localMatchedPath, 'utf8'));
    for (const item of localMatched) {
      if (item.tseId && item.file) {
        await prisma.candidate.updateMany({
          where: { tseId: item.tseId },
          data: { photoUrl: `/candidates/${item.file}` }
        });
        console.log(`Enriched ${item.name} (Local Asset) -> /candidates/${item.file}`);
      }
    }
  }

  console.log('All candidates enriched successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
