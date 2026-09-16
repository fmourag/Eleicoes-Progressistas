import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.zsrjpitpyhsmsxerzxzc:BZZe3q0EcrXXAwuB@54.94.90.106:6543/postgres?pgbouncer=true&connection_limit=1',
    },
  },
});

const API_CANDIDATES_DIR = path.resolve(process.cwd(), 'apps/api/public/candidates');
if (!fs.existsSync(API_CANDIDATES_DIR)) {
  fs.mkdirSync(API_CANDIDATES_DIR, { recursive: true });
}

// Lista oficial de líderes com fotos manuais específicas que devem ser preservadas
const PRESERVED_LEADERS: Record<string, string> = {
  '280001607829': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  'pres_13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  'gov_rj_paes': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Eduardo_Paes%2C_October_2024.jpg',
  '190002548141': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  'sen_rj_benedita': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  '190002543096': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  '190002536155': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Glauber_Braga_%28PSOL-RJ%29_%28cropped%29.jpg',
  '190002536156': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  'sen_rj_tarcisio': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  '190002543101': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'sen_rj_lindbergh': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'gov_rj_cyro': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  'gov_rj_juliete': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
};

const CLOUDFRONT_IPS = ['3.174.83.81', '3.174.83.99', '3.174.83.31', '3.174.83.108'];

function downloadFromCloudFront(uf: string, tseId: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const ip = CLOUDFRONT_IPS[Math.floor(Math.random() * CLOUDFRONT_IPS.length)];
    const req = https.request(
      {
        host: ip,
        port: 443,
        path: `/hermes-media/eleicoes/2026/candidatos/${uf.toLowerCase()}/${tseId}.jpg`,
        method: 'GET',
        servername: 'www.tribunapr.com.br',
        headers: {
          Host: 'www.tribunapr.com.br',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          Referer: 'https://www.gazetadopovo.com.br/',
        },
        timeout: 8000,
      },
      (res) => {
        if (res.statusCode !== 200) return resolve(null);
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (buf.length > 800 && buf[0] === 0xff && buf[1] === 0xd8) {
            return resolve(buf);
          }
          resolve(null);
        });
        res.on('error', () => resolve(null));
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

function savePhoto(tseId: string, buffer: Buffer) {
  fs.writeFileSync(path.join(API_CANDIDATES_DIR, `${tseId}.jpg`), buffer);
  fs.writeFileSync(path.join(API_CANDIDATES_DIR, `tse_${tseId}.jpg`), buffer);
}

async function main() {
  console.log('🌎 [ETAPA 1/3] Limpando fotos duplicadas ou atribuídas indevidamente nacionalmente...');

  const allWithPhotos = await prisma.candidate.findMany({
    where: { photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
    select: { id: true, name: true, state: true, cargo: true, party: true, tseId: true, photoUrl: true },
  });

  const photoCount: Record<string, number> = {};
  for (const c of allWithPhotos) {
    if (c.photoUrl) {
      photoCount[c.photoUrl] = (photoCount[c.photoUrl] || 0) + 1;
    }
  }

  let cleanedCount = 0;
  for (const c of allWithPhotos) {
    if (!c.photoUrl) continue;
    // Se for líder preservado, manter
    if (PRESERVED_LEADERS[c.tseId || ''] || PRESERVED_LEADERS[c.id]) continue;

    // Se for duplicada compartilhada por múltiplos candidatos
    const isDuplicate = photoCount[c.photoUrl] > 1;

    // Se for foto da câmara/senado para cargo que não seja DEPUTADO_FEDERAL/SENADOR
    const isCamaraUrl = c.photoUrl.includes('camara.leg.br');
    const isSenadoUrl = c.photoUrl.includes('senado.leg.br');
    const wrongCargoForDep = isCamaraUrl && c.cargo !== 'DEPUTADO_FEDERAL';
    const wrongCargoForSen = isSenadoUrl && c.cargo !== 'SENADOR';

    if (isDuplicate || wrongCargoForDep || wrongCargoForSen) {
      const newPhoto = (c.tseId && /^\d+$/.test(c.tseId)) ? `/candidates/${c.tseId}.jpg` : null;
      await prisma.candidate.update({
        where: { id: c.id },
        data: { photoUrl: newPhoto },
      });
      cleanedCount++;
    }
  }
  console.log(`✓ Limpeza concluída: ${cleanedCount} candidatos com fotos duplicadas/indevidas corrigidos.`);

  console.log('\n📥 [ETAPA 2/3] Baixando fotos oficiais do TSE 2026 via CDN para todos os estados...');
  const candidatesNeedingPhoto = await prisma.candidate.findMany({
    where: {
      tseId: { not: '' },
    },
    select: { id: true, name: true, state: true, cargo: true, tseId: true, photoUrl: true },
  });

  const numericCandidates = candidatesNeedingPhoto.filter((c) => c.tseId && /^\d+$/.test(c.tseId));
  console.log(`Total de candidatos com SQ_CANDIDATO do TSE: ${numericCandidates.length}`);

  let downloadedCount = 0;
  let alreadyPresentCount = 0;
  let failedCount = 0;
  let dbUpdatedCount = 0;

  // Processar em lotes de 20 para rapidez e estabilidade
  const BATCH_SIZE = 20;
  for (let i = 0; i < numericCandidates.length; i += BATCH_SIZE) {
    const batch = numericCandidates.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (cand) => {
        const tseId = cand.tseId!;
        const uf = (cand.state || 'rj').toLowerCase();
        const localPath = path.join(API_CANDIDATES_DIR, `${tseId}.jpg`);

        if (fs.existsSync(localPath)) {
          alreadyPresentCount++;
          if (cand.photoUrl !== `/candidates/${tseId}.jpg`) {
            await prisma.candidate.update({
              where: { id: cand.id },
              data: { photoUrl: `/candidates/${tseId}.jpg` },
            });
            dbUpdatedCount++;
          }
          return;
        }

        const buf = await downloadFromCloudFront(uf, tseId);
        if (buf) {
          savePhoto(tseId, buf);
          downloadedCount++;
          await prisma.candidate.update({
            where: { id: cand.id },
            data: { photoUrl: `/candidates/${tseId}.jpg` },
          });
          dbUpdatedCount++;
        } else {
          failedCount++;
        }
      })
    );

    if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= numericCandidates.length) {
      console.log(
        `Progresso: ${Math.min(i + BATCH_SIZE, numericCandidates.length)}/${numericCandidates.length} | Baixadas: ${downloadedCount} | Já existentes: ${alreadyPresentCount} | Atualizados no DB: ${dbUpdatedCount}`
      );
    }
  }

  console.log('\n📊 [ETAPA 3/3] Resumo da replicação nacional:');
  console.log(`- Fotos baixadas agora: ${downloadedCount}`);
  console.log(`- Fotos já presentes no cache local: ${alreadyPresentCount}`);
  console.log(`- Candidatos atualizados com /candidates/{tseId}.jpg no banco: ${dbUpdatedCount}`);
  console.log(`- Não encontradas no CDN (fallback ativo): ${failedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
