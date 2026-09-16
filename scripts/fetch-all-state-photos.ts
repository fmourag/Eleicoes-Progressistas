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
            if (buf.length > 500) {
              resolve(buf);
            } else {
              resolve(null);
            }
          });
          res.on('error', () => resolve(null));
        }
      )
      .on('error', () => resolve(null));
  });
}

const STATE_ARTICLES = [
  'Eleições estaduais no Rio de Janeiro em 2026',
  'Eleições estaduais em São Paulo em 2026',
  'Eleições estaduais em Minas Gerais em 2026',
  'Eleições estaduais na Bahia em 2026',
  'Eleições estaduais no Rio Grande do Sul em 2026',
  'Eleições estaduais no Paraná em 2026',
  'Eleições estaduais em Pernambuco em 2026',
  'Eleições estaduais no Ceará em 2026',
  'Eleições estaduais em Santa Catarina em 2026',
  'Eleições estaduais em Goiás em 2026',
  'Eleições estaduais no Pará em 2026',
  'Eleições estaduais no Maranhão em 2026',
  'Eleições estaduais no Amazonas em 2026',
  'Eleições estaduais no Espírito Santo em 2026',
  'Eleições estaduais na Paraíba em 2026',
  'Eleições estaduais no Rio Grande do Norte em 2026',
  'Eleições estaduais em Mato Grosso em 2026',
  'Eleições estaduais em Alagoas em 2026',
  'Eleições estaduais no Piauí em 2026',
  'Eleições estaduais no Distrito Federal em 2026',
  'Eleições estaduais em Mato Grosso do Sul em 2026',
  'Eleições estaduais em Sergipe em 2026',
  'Eleições estaduais em Rondônia em 2026',
  'Eleições estaduais no Tocantins em 2026',
  'Eleições estaduais no Acre em 2026',
  'Eleições estaduais no Amapá em 2026',
  'Eleições estaduais em Roraima em 2026',
  'Eleição presidencial no Brasil em 2026',
  'Eleições gerais no Brasil em 2026',
];

async function getFileUrl(fileTitle: string): Promise<string | null> {
  // 1. Try pt.wikipedia API directly with original title
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

  // 2. Try commons.wikimedia API with File: prefix
  const commonsTitle = fileTitle.replace(/^Ficheiro:/i, 'File:');
  const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    commonsTitle
  )}&prop=imageinfo&iiprop=url&format=json`;
  const data = await getJson(commonsUrl);
  const pages = data?.query?.pages;
  if (pages) {
    for (const pid of Object.keys(pages)) {
      const src = pages[pid]?.imageinfo?.[0]?.url;
      if (src) return src;
    }
  }
  return null;
}

async function main() {
  console.log('🚀 Iniciando Extração Massiva de Fotos de Eleições Estaduais e Gerais 2026...');

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const allCandidates = await prisma.candidate.findMany({
    select: { id: true, tseId: true, name: true, cargo: true, state: true, party: true, numeroUrna: true },
  });

  const photoMap: Record<string, string> = {};

  for (const article of STATE_ARTICLES) {
    console.log(`📄 Analisando artigo: "${article}"...`);
    const apiUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      article
    )}&prop=images&imlimit=100&format=json`;
    const data = await getJson(apiUrl);
    const pages = data?.query?.pages;
    if (!pages) continue;

    const pageId = Object.keys(pages)[0];
    const images: Array<{ title: string }> = pages[pageId]?.images || [];

    for (const img of images) {
      const title = img.title;
      if (title.endsWith('.svg') || title.endsWith('.png') || title.includes('Bandeira') || title.includes('Brasão') || title.includes('marker')) {
        continue;
      }

      // Check if title has TSE ID e.g. (190002552513)
      const tseMatch = title.match(/(\d{11,13})/);
      let matchedCandidate = null;

      if (tseMatch && tseMatch[1]) {
        matchedCandidate = allCandidates.find((c) => c.tseId === tseMatch[1]);
      }

      // If not matched by TSE ID, try matching by name
      if (!matchedCandidate) {
        const cleanTitle = title
          .replace(/^Ficheiro:/i, '')
          .replace(/^File:/i, '')
          .replace(/\.jpg$/i, '')
          .replace(/\.jpeg$/i, '')
          .replace(/FOTO /i, '')
          .replace(/ 2026/i, '')
          .replace(/ 2024/i, '')
          .replace(/ 2022/i, '')
          .replace(/ \(cropped.*\)/i, '')
          .trim();

        matchedCandidate = allCandidates.find((c) => {
          const cName = c.name.toLowerCase();
          const tName = cleanTitle.toLowerCase();
          return cName.includes(tName) || tName.includes(cName) || (cleanTitle.length > 5 && cName.split(' ').slice(0, 2).join(' ').includes(tName.split(' ').slice(0, 2).join(' ')));
        });
      }

      if (matchedCandidate) {
        console.log(`  🎯 Match encontrado: ${title} -> ${matchedCandidate.name} (${matchedCandidate.cargo} ${matchedCandidate.state}, TSE: ${matchedCandidate.tseId})`);
        const fileUrl = await getFileUrl(title);
        if (fileUrl) {
          photoMap[matchedCandidate.tseId] = fileUrl;
          console.log(`     URL: ${fileUrl}`);
          const buf = await downloadBuffer(fileUrl);
          if (buf) {
            for (const dir of targetDirs) {
              fs.writeFileSync(path.join(dir, `${matchedCandidate.tseId}.jpg`), buf);
              fs.writeFileSync(path.join(dir, `tse_${matchedCandidate.tseId}.jpg`), buf);
            }
            await prisma.candidate.updateMany({
              where: { id: matchedCandidate.id },
              data: { photoUrl: fileUrl },
            });
            console.log(`     ✅ Salvo com sucesso (${buf.length} bytes)`);
          }
        }
      }
    }
  }

  // Save the map to a JSON file for reference
  fs.writeFileSync('scripts/resolved-state-photos.json', JSON.stringify(photoMap, null, 2));
  console.log(`🎉 Concluído! Total de fotos mapeadas: ${Object.keys(photoMap).length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
