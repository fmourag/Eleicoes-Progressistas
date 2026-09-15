import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full photo enrichment...');

  // 1. Presidential Candidates (2026)
  const presidentialPhotos = [
    {
      tseId: '280002542548',
      name: 'Luiz Inácio Lula da Silva',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
    },
    {
      tseId: '280002551975',
      name: 'Edmilson Silva Costa',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Edmilson_Costa_%28cropped%29.jpg/500px-Edmilson_Costa_%28cropped%29.jpg',
    },
    {
      tseId: '280002538811',
      name: 'Samara Martins',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Samara_Martins_em_2024.jpg/500px-Samara_Martins_em_2024.jpg',
    },
    {
      tseId: '280002541457',
      name: 'Hertz Dias',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hertz_Dias_%28cropped%29.jpg/500px-Hertz_Dias_%28cropped%29.jpg',
    },
    {
      tseId: '280002552487',
      name: 'Rui Costa Pimenta',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rui_Costa_Pimenta_2018.jpg/500px-Rui_Costa_Pimenta_2018.jpg',
    },
    {
      tseId: '190002540198',
      name: 'Cyro Garcia',
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg/500px-2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
    },
    {
      tseId: 'gov_rj_juliete',
      name: 'Juliete Pantoja',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
    },
  ];

  for (const p of presidentialPhotos) {
    const updated = await prisma.candidate.updateMany({
      where: { OR: [{ tseId: p.tseId }, { name: { contains: p.name, mode: 'insensitive' } }] },
      data: { photoUrl: p.url },
    });
    console.log(`Enriched ${p.name} (${updated.count} records updated) -> ${p.url}`);
  }

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
