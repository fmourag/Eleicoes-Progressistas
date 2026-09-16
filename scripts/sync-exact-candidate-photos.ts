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

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            Referer: 'https://www.estadao.com.br/',
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
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${tseId}.jpg`), buffer);
      fs.writeFileSync(path.join(dir, `tse_${tseId}.jpg`), buffer);
    } catch (err: any) {
      console.warn(`[savePhoto] Failed writing ${tseId} to ${dir}:`, err.message);
    }
  }
}

interface ExactPhotoMapping {
  tseIds?: string[];
  exactName?: string;
  photoUrl: string;
}

const EXACT_CANDIDATE_PHOTO_ENTRIES: ExactPhotoMapping[] = [
  {
    tseIds: ['190002543080'],
    exactName: 'ANIELLE FRANCISCO DA SILVA',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/2023-01-26_Anielle_Franco.JPG',
  },
  {
    tseIds: ['190002536141'],
    exactName: 'ANDRE MAGALHAES BARROS',
    photoUrl: 'https://img.estadao.com.br/fotos/politica/eleicoes-2024/RJ/FRJ190002142552_div.jpg',
  },
  {
    tseIds: ['190002548141'],
    exactName: 'BENEDITA SOUZA DA SILVA SAMPAIO',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  },
  {
    tseIds: ['190002536156', 'dep_204464'],
    exactName: 'TALÍRIA PETRONE SOARES',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  },
  {
    tseIds: ['190002543096', 'dep_74848'],
    exactName: 'JANDIRA FEGHALI',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  },
  {
    tseIds: ['dep_220615'],
    exactName: 'Pastor Henrique Vieira',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  },
  {
    tseIds: ['190002536155'],
    exactName: 'GLAUBER DE MEDEIROS BRAGA',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Glauber_Braga_%28PSOL-RJ%29_%28cropped%29.jpg',
  },
  {
    tseIds: ['190002543092'],
    exactName: 'MARCELO RIBEIRO FREIXO',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/204480.jpg',
  },
  {
    tseIds: ['190002534839'],
    exactName: 'AUREO LIDIO MOREIRA RIBEIRO',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/160512.jpg',
  },
  {
    tseIds: ['190002543070'],
    exactName: 'LEONARDO CARNEIRO MONTEIRO PICCIANI',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/74295.jpg',
  },
  {
    tseIds: ['190002536120', 'ale_rj_renatasouza'],
    exactName: 'RENATA DA SILVA SOUZA',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Renata_Souza_em_2022.jpg',
  },
  {
    tseIds: ['190002537751', 'ale_rj_carlosminc'],
    exactName: 'CARLOS MINC BAUMFELD',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Carlos_Minc_2022.jpg',
  },
  {
    tseIds: ['ale_rj_danimonteiro'],
    exactName: 'Danielle Monteiro da Silva',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Dani_Monteiro.jpg',
  },
  {
    tseIds: ['250002539604'],
    exactName: 'SÂMIA DE SOUZA BOMFIM',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/204489.jpg',
  },
  {
    tseIds: ['250002539934'],
    exactName: 'LUIZA ERUNDINA DE SOUSA',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/74784.jpg',
  },
  {
    tseIds: ['sen_mg_duda', 'dep_220623', '130002539728'],
    exactName: 'DUDA SALABERT',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  },
  {
    tseIds: ['dep_160575'],
    exactName: 'Erika Kokay',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  },
  {
    tseIds: ['sen_rj_tarcisio'],
    exactName: 'Tarcísio Motta de Carvalho',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  },
  {
    tseIds: ['sen_rj_lindbergh', '190002543101'],
    exactName: 'LUIZ LINDBERGH FARIAS FILHO',
    photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  },
  {
    tseIds: ['gov_rj_cyro', '190002540198'],
    exactName: 'CYRO GARCIA',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  },
  {
    tseIds: ['gov_rj_juliete', '190002547272'],
    exactName: 'JULIETE PANTOJA ALVES',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  },
  {
    tseIds: ['gov_rj_paes'],
    exactName: 'Eduardo da Costa Paes',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Eduardo_Paes%2C_October_2024.jpg',
  },
];

async function main() {
  console.log('🔄 Executando sincronização precisa de fotos reais dos candidatos...');

  for (const entry of EXACT_CANDIDATE_PHOTO_ENTRIES) {
    let candidates: any[] = [];
    if (entry.tseIds && entry.tseIds.length > 0) {
      candidates = await prisma.candidate.findMany({
        where: {
          tseId: { in: entry.tseIds },
        },
      });
    }

    if (candidates.length === 0 && entry.exactName) {
      candidates = await prisma.candidate.findMany({
        where: {
          name: { equals: entry.exactName, mode: 'insensitive' },
        },
      });
    }

    if (candidates.length === 0) {
      console.log(`⚠️ Nenhum candidato encontrado para: ${entry.exactName || entry.tseIds?.join(', ')}`);
      continue;
    }

    const buf = await downloadBuffer(entry.photoUrl);
    if (!buf) {
      console.log(`⚠️ Falha ao baixar foto: ${entry.photoUrl}`);
      continue;
    }

    for (const cand of candidates) {
      savePhoto(cand.tseId, buf);
      await prisma.candidate.update({
        where: { id: cand.id },
        data: { photoUrl: entry.photoUrl },
      });
      console.log(`✅ Foto real salva para ${cand.name} (${cand.party} ${cand.state}, TSE: ${cand.tseId})`);
    }
  }
}

main().finally(() => prisma.$disconnect());
