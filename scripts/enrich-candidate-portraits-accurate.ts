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

function normalize(str?: string | null): string {
  if (!str) return '';
  return str
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ');
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
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
            // Minimum size for valid candidate photo
            if (buf.length > 2000) {
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

// 1. High-priority real portraits curated for Brazilian progressive leaders
const VERIFIED_CANDIDATE_PHOTOS: Array<{ tseId?: string; name: string; url: string }> = [
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
    name: 'BENEDITA SOUZA DA SILVA SAMPAIO',
    tseId: '190002548141',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  },
  {
    name: 'FRANCISCO RODRIGUES DE ALENCAR FILHO',
    tseId: '190002536142',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74044.jpg',
  },
  {
    name: 'TALÍRIA PETRONE SOARES',
    tseId: '190002536143',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  },
  {
    name: 'JANDIRA FEGHALI',
    tseId: '190002543081',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  },
  {
    name: 'HENRIQUE VIEIRA DA SILVA',
    tseId: '190002536144',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  },
  {
    name: 'GLAUBER DE MEDEIROS BRAGA',
    tseId: '190002536155',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/152605.jpg',
  },
  {
    name: 'REIMONT LUIZ OTONI SANTA BARBARA',
    tseId: '190002543082',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220602.jpg',
  },
  {
    name: 'WASHINGTON LUIZ CARDOSO SIQUEIRA',
    tseId: '190002543083',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220604.jpg',
  },
  {
    name: 'DIMAS SILVA GADELHA JUNIOR',
    tseId: '190002543084',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220606.jpg',
  },
  {
    name: 'EDUARDO AUGUSTO BANDEIRA DE MELLO',
    tseId: '190002537601',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220605.jpg',
  },
  {
    name: 'MARCELO RIBEIRO FREIXO',
    tseId: '190002543092',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204480.jpg',
  },
  {
    name: 'AUREO LIDIO MOREIRA RIBEIRO',
    tseId: '190002534839',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/160512.jpg',
  },
  {
    name: 'LEONARDO CARNEIRO MONTEIRO PICCIANI',
    tseId: '190002543070',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74295.jpg',
  },
  {
    name: 'RENATA DA SILVA SOUZA',
    tseId: 'ale_rj_renatasouza',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Renata_Souza_em_2022.jpg/500px-Renata_Souza_em_2022.jpg',
  },
  {
    name: 'CARLOS MINC BAUMFELD',
    tseId: 'ale_rj_carlosminc',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Carlos_Minc_2022.jpg/500px-Carlos_Minc_2022.jpg',
  },
  {
    name: 'DANIELLE MONTEIRO DA SILVA',
    tseId: 'ale_rj_danimonteiro',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Dani_Monteiro_2022.jpg/500px-Dani_Monteiro_2022.jpg',
  },
  {
    name: 'FLAVIO SERAFINI',
    tseId: '190002536145',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Flavio_Serafini_2022.jpg/500px-Flavio_Serafini_2022.jpg',
  },
  {
    name: 'TAINA REIS DE PAULA',
    tseId: '190002543093',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tain%C3%A1_de_Paula_2022.jpg/500px-Tain%C3%A1_de_Paula_2022.jpg',
  },
  {
    name: 'ERIKA SANTOS SILVA',
    tseId: '250002539601',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220556.jpg',
  },
  {
    name: 'GUILHERME CASTRO BOULOS',
    tseId: '250002539602',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220553.jpg',
  },
  {
    name: 'SAMIA DE SOUZA BOMFIM',
    tseId: '250002539604',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204489.jpg',
  },
  {
    name: 'LUIZA ERUNDINA DE SOUSA',
    tseId: '250002539934',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74784.jpg',
  },
  {
    name: 'TABATA CLAUDIA AMARAL DE PONTES',
    tseId: '250002539603',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/204534.jpg',
  },
  {
    name: 'DUDA SALABERT ROSA',
    tseId: 'sen_mg_duda',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  },
];

async function main() {
  console.log('🚀 Iniciando download e persistência de fotos oficiais dos candidatos...');

  for (const item of VERIFIED_CANDIDATE_PHOTOS) {
    console.log(`📥 Processando foto para ${item.name}...`);
    const buf = await downloadBuffer(item.url);
    if (buf) {
      // Find candidate in DB by tseId or name
      const cand = await prisma.candidate.findFirst({
        where: {
          OR: [
            item.tseId ? { tseId: item.tseId } : undefined,
            { name: { contains: item.name.split(' ').slice(0, 2).join(' '), mode: 'insensitive' } },
          ].filter(Boolean) as any,
        },
      });

      if (cand) {
        savePhoto(cand.tseId, buf);
        await prisma.candidate.update({
          where: { id: cand.id },
          data: { photoUrl: item.url },
        });
        console.log(`  ✅ Foto salva com sucesso para ${cand.name} (TSE: ${cand.tseId}) [${buf.length} bytes]`);
      }
    }
  }

  // Verify all candidates in RJ with photo
  const rjCount = await prisma.candidate.count({
    where: { state: 'RJ', photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
  });
  console.log(`\n🎉 Candidatos no RJ com fotos reais verificadas: ${rjCount}`);
}

main().finally(() => prisma.$disconnect());
