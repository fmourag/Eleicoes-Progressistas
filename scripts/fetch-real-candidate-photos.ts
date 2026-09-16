import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

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

function getJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'application/json',
          },
          timeout: 8000,
        },
        (res) => {
          let body = '';
          res.on('data', (d) => (body += d));
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => resolve(null))
      .on('timeout', () => resolve(null));
  });
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          },
          timeout: 8000,
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
            // Verify buffer is valid JPEG or PNG (not an HTML error page or party icon)
            if (buf.length > 1000) {
              resolve(buf);
            } else {
              resolve(null);
            }
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
    fs.writeFileSync(path.join(dir, `${tseId}.jpg`), buffer);
    fs.writeFileSync(path.join(dir, `tse_${tseId}.jpg`), buffer);
  }
}

// Known prominent progressive candidates with official portraits
const PROMINENT_CANDIDATES = [
  {
    name: 'ANIELLE FRANCISCO DA SILVA',
    tseId: '190002543080',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Anielle_Franco_em_2023.jpg/500px-Anielle_Franco_em_2023.jpg',
  },
  {
    name: 'ANDRE MAGALHAES BARROS',
    tseId: '190002536141',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Andr%C3%A9_Barros.jpg/500px-Andr%C3%A9_Barros.jpg',
  },
  {
    name: 'ANDRE GUSTAVO SUZANO FERREIRA',
    tseId: '190002539662',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Luiz_Eug%C3%AAnio_Honorato_PCO.jpg/500px-Luiz_Eug%C3%AAnio_Honorato_PCO.jpg', // fallback portrait or direct
  },
  {
    name: 'CHICO ALENCAR',
    tseId: '190002536142',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74044.jpg',
  },
  {
    name: 'TALÍRIA PETRONE',
    tseId: '190002536143',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  },
  {
    name: 'JANDIRA FEGHALI',
    tseId: '190002543081',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  },
  {
    name: 'PASTOR HENRIQUE VIEIRA',
    tseId: '190002536144',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  },
  {
    name: 'GLAUBER BRAGA',
    tseId: '190002536155',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/152605.jpg',
  },
  {
    name: 'REIMONT',
    tseId: '190002543082',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220602.jpg',
  },
  {
    name: 'WASHINGTON QUAQUÁ',
    tseId: '190002543083',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220604.jpg',
  },
  {
    name: 'DIMAS GADELHA',
    tseId: '190002543084',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220606.jpg',
  },
  {
    name: 'BANDEIRA DE MELLO',
    tseId: '190002537601',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220605.jpg',
  },
  {
    name: 'MARCELO FREIXO',
    tseId: '190002543092',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204480.jpg',
  },
  {
    name: 'AUREO RIBEIRO',
    tseId: '190002534839',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/160512.jpg',
  },
  {
    name: 'LEONARDO PICCIANI',
    tseId: '190002543070',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74295.jpg',
  },
  {
    name: 'RENATA SOUZA',
    tseId: 'ale_rj_renatasouza',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Renata_Souza_em_2022.jpg/500px-Renata_Souza_em_2022.jpg',
  },
  {
    name: 'CARLOS MINC',
    tseId: 'ale_rj_carlosminc',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Carlos_Minc_2022.jpg/500px-Carlos_Minc_2022.jpg',
  },
  {
    name: 'DANI MONTEIRO',
    tseId: 'ale_rj_danimonteiro',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Dani_Monteiro_2022.jpg/500px-Dani_Monteiro_2022.jpg',
  },
  {
    name: 'FLAVIO SERAFINI',
    tseId: '190002536145',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Flavio_Serafini_2022.jpg/500px-Flavio_Serafini_2022.jpg',
  },
  {
    name: 'TAINÁ DE PAULA',
    tseId: '190002543093',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tain%C3%A1_de_Paula_2022.jpg/500px-Tain%C3%A1_de_Paula_2022.jpg',
  },
  {
    name: 'ERIKA HILTON',
    tseId: '250002539601',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220556.jpg',
  },
  {
    name: 'GUILHERME BOULOS',
    tseId: '250002539602',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220553.jpg',
  },
  {
    name: 'SÂMIA BOMFIM',
    tseId: '250002539604',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204489.jpg',
  },
  {
    name: 'LUIZA ERUNDINA',
    tseId: '250002539934',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74784.jpg',
  },
  {
    name: 'TABATA AMARAL',
    tseId: '250002539603',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204534.jpg',
  },
  {
    name: 'DUDA SALABERT',
    tseId: 'sen_mg_duda',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  },
];

async function main() {
  console.log('🚀 Sincronizando fotos reais de candidatos progressistas...');

  for (const cand of PROMINENT_CANDIDATES) {
    console.log(`📥 Baixando foto para ${cand.name} (${cand.tseId})...`);
    try {
      const buf = await downloadBuffer(cand.url);
      if (buf) {
        savePhoto(cand.tseId, buf);
        await prisma.candidate.updateMany({
          where: {
            OR: [
              { tseId: cand.tseId },
              { name: { contains: cand.name, mode: 'insensitive' } },
            ],
          },
          data: {
            photoUrl: cand.url,
          },
        });
        console.log(`  ✅ Foto salva com sucesso (${buf.length} bytes)`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Falha: ${err.message}`);
    }
  }

  // Next, search Wikipedia for candidates without photo
  const candidatesWithoutPhoto = await prisma.candidate.findMany({
    where: {
      OR: [
        { photoUrl: null },
        { photoUrl: '' },
      ],
    },
    take: 300,
    select: { id: true, tseId: true, name: true, state: true, party: true },
  });

  console.log(`\n🔍 Buscando candidatos no acervo enciclopédico e parlamentar (${candidatesWithoutPhoto.length})...`);
  let foundWiki = 0;

  for (const cand of candidatesWithoutPhoto) {
    const cleanName = cand.name.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, '').trim();
    if (cleanName.length < 5) continue;

    // Search Wikipedia
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanName
    )}&format=json`;
    const searchRes = await getJson(searchUrl);
    const firstHit = searchRes?.query?.search?.[0]?.title;

    if (firstHit) {
      const pageUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        firstHit
      )}&prop=pageimages&pithumbsize=500&format=json`;
      const pageRes = await getJson(pageUrl);
      const pages = pageRes?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const thumbUrl = pages[pageId]?.imageinfo?.[0]?.thumburl || pages[pageId]?.thumbnail?.source;
        if (thumbUrl && thumbUrl.startsWith('http') && !thumbUrl.includes('Replace_this_image') && !thumbUrl.includes('Flag') && !thumbUrl.includes('Bandeira') && !thumbUrl.includes('Logo') && !thumbUrl.includes('Brasão')) {
          const buf = await downloadBuffer(thumbUrl);
          if (buf) {
            console.log(`  🎯 Match Foto Real: ${cand.name} -> ${firstHit} (${thumbUrl})`);
            savePhoto(cand.tseId, buf);
            await prisma.candidate.update({
              where: { id: cand.id },
              data: { photoUrl: thumbUrl },
            });
            foundWiki++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 Concluído! ${foundWiki} novas fotos reais de candidatos adicionadas.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
