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

function downloadBuffer(url: string, customHeaders: Record<string, string> = {}): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            ...customHeaders,
          },
          timeout: 8000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            return downloadBuffer(redirectUrl, customHeaders).then(resolve);
          }
          if (res.statusCode !== 200) {
            return resolve(null);
          }
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length > 800) {
              const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
              const isPng = buf[0] === 0x89 && buf[1] === 0x50;
              const isWebp = buf.slice(0, 4).toString() === 'RIFF';
              if (isJpeg || isPng || isWebp) {
                return resolve(buf);
              }
            }
            resolve(null);
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
      fs.writeFileSync(path.join(dir, `${tseId}.jpg`), buffer);
      fs.writeFileSync(path.join(dir, `tse_${tseId}.jpg`), buffer);
    } catch (err: any) {
      console.warn(`[savePhoto] Failed writing ${tseId} to ${dir}:`, err.message);
    }
  }
}

async function getJson(url: string, customHeaders: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
            ...customHeaders,
          },
          timeout: 8000,
        },
        (res) => {
          if (res.statusCode !== 200) return resolve(null);
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
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

// Mapeamento explícito de fotos oficiais e santinhos para lideranças e candidatos reportados
const EXPLICIT_CANDIDATE_PORTRAITS: Record<string, string> = {
  // Pratinha (PSB RJ, Dep Federal 4090)
  '190002538441': 'https://img.estadao.com.br/fotos/politica/eleicoes-2024/RJ/FRJ190002358886_div.jpg',
  // Toninho Bondade (PDT RJ, Dep Federal 1225)
  '190002554118': 'https://yt3.googleusercontent.com/PgiNucUFgcMiNipdhuWxVAw9CDJv6zTpbir6VtZfJnKdlPapAbZzelWIIXgQBzzci5ajM89NhQ=s800-c-k-c0x00ffffff-no-rj',
  // Dr. Lobão (PT RJ, Dep Federal 1344)
  '190002543066': 'https://img.estadao.com.br/fotos/politica/eleicoes-2024/RJ/FRJ190002134271_div.jpg',
  // André Barros (PSOL RJ)
  '190002536141': 'https://img.estadao.com.br/fotos/politica/eleicoes-2024/RJ/FRJ190002142552_div.jpg',
  // Anielle Franco
  '190002543080': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/2023-01-26_Anielle_Franco.JPG',
  // Benedita da Silva
  '190002548141': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  'sen_rj_benedita': 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  // Talíria Petrone
  '190002536156': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  'dep_204464': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  // Jandira Feghali
  '190002543096': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  'dep_74848': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  // Pastor Henrique Vieira
  'dep_220615': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  // Glauber Braga
  '190002536155': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Glauber_Braga_%28PSOL-RJ%29_%28cropped%29.jpg',
  // Marcelo Freixo
  '190002543092': 'https://www.camara.leg.br/internet/deputado/bandep/204480.jpg',
  // Aureo Ribeiro
  '190002534839': 'https://www.camara.leg.br/internet/deputado/bandep/160512.jpg',
  // Leonardo Picciani
  '190002543070': 'https://www.camara.leg.br/internet/deputado/bandep/74295.jpg',
  // Renata Souza
  '190002536120': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Renata_Souza_em_2022.jpg',
  'ale_rj_renatasouza': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Renata_Souza_em_2022.jpg',
  // Carlos Minc
  '190002537751': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Carlos_Minc_2022.jpg',
  'ale_rj_carlosminc': 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Carlos_Minc_2022.jpg',
  // Dani Monteiro
  'ale_rj_danimonteiro': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Dani_Monteiro.jpg',
  // Sâmia Bomfim
  '250002539604': 'https://www.camara.leg.br/internet/deputado/bandep/204489.jpg',
  // Luiza Erundina
  '250002539934': 'https://www.camara.leg.br/internet/deputado/bandep/74784.jpg',
  // Duda Salabert
  '130002539728': 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  'dep_220623': 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  'sen_mg_duda': 'https://www.camara.leg.br/internet/deputado/bandep/220573.jpg',
  // Erika Kokay
  'dep_160575': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  // Tarcísio Motta
  'sen_rj_tarcisio': 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  // Lindbergh Farias
  '190002543101': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  'sen_rj_lindbergh': 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  // Cyro Garcia
  '190002540198': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  'gov_rj_cyro': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  // Juliete Pantoja
  '190002547272': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  'gov_rj_juliete': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  // Eduardo Paes
  'gov_rj_paes': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Eduardo_Paes%2C_October_2024.jpg',
  // Alessandro Molon
  'sen_rj_molon': 'https://upload.wikimedia.org/wikipedia/commons/3/39/Alessandro_Molon_em_julho_de_2018_%28recorte%29.jpg',
  // Chico Alencar
  '190002536144': 'https://www.camara.leg.br/internet/deputado/bandep/74187.jpg',
  'dep_74171': 'https://www.camara.leg.br/internet/deputado/bandep/74187.jpg',
  // Rodrigo Neves
  'gov_rj_neves': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rodrigo_Neves_em_2018.jpg/500px-Rodrigo_Neves_em_2018.jpg',
  // Mônica Benício
  '190002536164': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/M%C3%B4nica_Ben%C3%ADcio_%2849234235991%29_%28cropped_2%29.jpg/500px-M%C3%B4nica_Ben%C3%ADcio_%2849234235991%29_%28cropped_2%29.jpg',
  // William Siri
  '190002536162': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/William_Siri.jpeg',
  'gov_rj_siri': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/William_Siri.jpeg',
  // Nísia Trindade
  '190002543091': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N%C3%ADsia_Trindade_%2852615467367%29.jpg/500px-N%C3%ADsia_Trindade_%2852615467367%29.jpg',
  // Fabiano Horta
  '190002543065': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Fabiano_Horta_em_2017.jpg/500px-Fabiano_Horta_em_2017.jpg',
  // Benny Briolly
  '190002543064': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Benny_Briolly_em_2022.jpg/500px-Benny_Briolly_em_2022.jpg',
  // Tatiana Roque
  '190002538422': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tatiana_Roque_%28cropped%29.jpg/500px-Tatiana_Roque_%28cropped%29.jpg',
  // Celso Pansera
  '190002543095': 'https://www.camara.leg.br/internet/deputado/bandep/72912.jpg',
  // Martha Rocha
  '190002539672': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Delegada_Martha_Rocha_2022.jpg/500px-Delegada_Martha_Rocha_2022.jpg',
  // Dimas Gadelha
  '190002543102': 'https://www.camara.leg.br/internet/deputado/bandep/220593.jpg',
  // Marcos Paulo
  '190002539658': 'https://www.camara.leg.br/internet/deputado/bandep/220597.jpg',
};

async function main() {
  console.log('🚀 Executando enriquecimento de fotos de candidatos, santinhos e campanhas...');

  // 1. Sincronizar candidatos prioritários
  for (const [tseId, photoUrl] of Object.entries(EXPLICIT_CANDIDATE_PORTRAITS)) {
    const buf = await downloadBuffer(photoUrl);
    if (buf) {
      savePhoto(tseId, buf);
      const candidates = await prisma.candidate.findMany({
        where: { tseId },
      });
      for (const cand of candidates) {
        await prisma.candidate.update({
          where: { id: cand.id },
          data: { photoUrl },
        });
        console.log(`✅ [Prioritário] ${cand.name} (${cand.party} ${cand.state}, TSE: ${cand.tseId})`);
      }
    }
  }

  // 2. Sincronizar deputados com matching exato na Câmara dos Deputados
  console.log('\n[2/2] Sincronizando com base oficial da Câmara dos Deputados...');
  const chamberData = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000&ordem=ASC&ordenarPor=nome');
  const deputies: any[] = chamberData?.dados || [];
  console.log(`Deputados obtidos: ${deputies.length}`);

  let chamberCount = 0;
  for (const dep of deputies) {
    if (!dep.urlFoto) continue;
    const normDep = normalize(dep.nome);
    if (!normDep || normDep.length < 5) continue;

    const depWords = normDep.split(' ').filter((w: string) => w.length > 2);
    const candidates = await prisma.candidate.findMany({
      where: {
        state: dep.siglaUf || undefined,
        name: { contains: dep.nome, mode: 'insensitive' },
      },
    });

    for (const cand of candidates) {
      const normCand = normalize(cand.name);
      const allWordsMatch = depWords.every((w: string) => normCand.includes(w));
      if (allWordsMatch) {
        const buf = await downloadBuffer(dep.urlFoto);
        if (buf) {
          savePhoto(cand.tseId, buf);
          await prisma.candidate.update({
            where: { id: cand.id },
            data: { photoUrl: dep.urlFoto },
          });
          chamberCount++;
          console.log(`  🏛️ Câmara: ${cand.name} (${cand.party} ${cand.state})`);
        }
      }
    }
  }
  console.log(`✅ Total mapeados via Câmara: ${chamberCount}`);
  console.log('\n🎉 Finalizado enriquecimento com fotos de alta qualidade e santinhos.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
