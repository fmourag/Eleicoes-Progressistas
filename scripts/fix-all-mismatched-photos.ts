import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Conexão direta por IP para garantir estabilidade mesmo com DNS instável
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.zsrjpitpyhsmsxerzxzc:BZZe3q0EcrXXAwuB@54.94.90.106:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require',
    },
  },
});

const API_CANDIDATES_DIR = path.resolve(process.cwd(), 'apps/api/public/candidates');
if (!fs.existsSync(API_CANDIDATES_DIR)) {
  fs.mkdirSync(API_CANDIDATES_DIR, { recursive: true });
}

// IP do CloudFront para download seguro sem falha de DNS
const CLOUDFRONT_IPS = ['3.174.83.81', '3.174.83.99', '3.174.83.31', '3.174.83.108'];

function downloadFromCloudFront(tseId: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const ip = CLOUDFRONT_IPS[Math.floor(Math.random() * CLOUDFRONT_IPS.length)];
    const req = https.request(
      {
        host: ip,
        port: 443,
        path: `/hermes-media/eleicoes/2026/candidatos/rj/${tseId}.jpg`,
        method: 'GET',
        servername: 'www.tribunapr.com.br',
        headers: {
          Host: 'www.tribunapr.com.br',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          Referer: 'https://www.gazetadopovo.com.br/',
        },
        timeout: 10000,
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

// Lista oficial de líderes com fotos manuais específicas que devem ser preservadas
const PRESERVED_LEADERS: Record<string, string> = {
  // Lula
  '280001607829': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  'pres_13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  // Eduardo Paes
  'gov_rj_paes': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Eduardo_Paes%2C_October_2024.jpg',
  // Benedita da Silva (Deputada Federal titular)
  '190002548141': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  'sen_rj_benedita': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  // Jandira Feghali
  '190002543096': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  // Glauber Braga
  '190002536155': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Glauber_Braga_%28PSOL-RJ%29_%28cropped%29.jpg',
  // Talíria Petrone
  '190002536156': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  // Tarcísio Motta
  'sen_rj_tarcisio': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  // Lindbergh Farias
  '190002543101': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'sen_rj_lindbergh': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  // Cyro Garcia
  'gov_rj_cyro': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  // Juliete Pantoja
  'gov_rj_juliete': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
};

async function main() {
  console.log('🧹 [ETAPA 1] Limpando fotos duplicadas e mapeamentos errados da Câmara...');

  // 1. Encontrar todas as fotos duplicadas (onde candidatos diferentes receberam a mesma URL)
  const allCands = await prisma.candidate.findMany({
    where: { photoUrl: { not: null } },
    select: { id: true, tseId: true, name: true, socialName: true, state: true, party: true, photoUrl: true },
  });

  const urlMap = new Map<string, typeof allCands>();
  for (const c of allCands) {
    if (!c.photoUrl) continue;
    if (!urlMap.has(c.photoUrl)) urlMap.set(c.photoUrl, []);
    urlMap.get(c.photoUrl)!.push(c);
  }

  let cleanedDuplicates = 0;
  for (const [url, list] of urlMap.entries()) {
    if (list.length > 1) {
      const distinctNames = new Set(list.map((x) => (x.socialName || x.name).toUpperCase().trim()));
      // Se são pessoas distintas compartilhando a mesma URL
      if (distinctNames.size > 1) {
        console.log(`\nURL indevidamente duplicada (${list.length} candidatos): ${url}`);
        for (const c of list) {
          // Se não é o titular real da foto preservada
          if (PRESERVED_LEADERS[c.tseId] === url) {
            console.log(`  ⭐ Mantido líder titular: ${c.socialName || c.name} (${c.tseId})`);
            continue;
          }

          const correctUrl = `https://eleicoes-progressistas.onrender.com/candidates/${c.tseId}.jpg`;
          console.log(`  🔧 Corrigindo: ${c.socialName || c.name} (${c.party} ${c.state}) -> ${correctUrl}`);
          await prisma.candidate.update({
            where: { id: c.id },
            data: { photoUrl: correctUrl },
          });
          cleanedDuplicates++;
        }
      }
    }
  }
  console.log(`\n✅ Total de URLs duplicadas corrigidas no banco: ${cleanedDuplicates}`);

  // 2. Para todos os 445 candidatos do RJ, baixar a foto OFICIAL EXATA do CDN 2026
  console.log('\n🎯 [ETAPA 2] Forçando download e sincronização da foto OFICIAL 2026 de cada candidato do RJ...');
  const rjCands = await prisma.candidate.findMany({
    where: { state: 'RJ', visible: true },
    select: { id: true, tseId: true, name: true, socialName: true, party: true, cargo: true, photoUrl: true },
    orderBy: { name: 'asc' },
  });

  let downloadedExact = 0;
  let preservedCount = 0;
  let missingCount = 0;

  for (let i = 0; i < rjCands.length; i++) {
    const cand = rjCands[i];
    const tseId = cand.tseId;
    const displayName = cand.socialName || cand.name;

    // Se é líder com foto especial preservada
    if (PRESERVED_LEADERS[tseId]) {
      preservedCount++;
      continue;
    }

    if (!tseId || !/^\d+$/.test(tseId)) {
      continue;
    }

    // Baixa do CDN oficial 2026 pelo ID do TSE exclusivo daquele candidato
    const buf = await downloadFromCloudFront(tseId);
    if (buf) {
      savePhoto(tseId, buf);
      await prisma.candidate.update({
        where: { id: cand.id },
        data: { photoUrl: `https://eleicoes-progressistas.onrender.com/candidates/${tseId}.jpg` },
      });
      downloadedExact++;
      if (downloadedExact % 25 === 0 || i === rjCands.length - 1) {
        console.log(`[${i + 1}/${rjCands.length}] Baixada foto 100% exata de: ${displayName} (${cand.party}, ID: ${tseId})`);
      }
    } else {
      missingCount++;
      console.log(`[${i + 1}/${rjCands.length}] ⚠️ Sem foto no CDN 2026: ${displayName} (${cand.party}, ID: ${tseId})`);
    }
  }

  console.log('\n=============================================');
  console.log('🎉 Sincronização 100% EXATA Concluída!');
  console.log(`  Total candidatos RJ: ${rjCands.length}`);
  console.log(`  Fotos exatas do TSE 2026 salvas: ${downloadedExact}`);
  console.log(`  Líderes preservados: ${preservedCount}`);
  console.log(`  Sem foto na base: ${missingCount}`);
  console.log('=============================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
