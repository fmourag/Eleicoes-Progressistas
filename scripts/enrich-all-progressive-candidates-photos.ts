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

function downloadBuffer(url: string, headers: Record<string, string> = {}): Promise<Buffer | null> {
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
            ...headers,
          },
          timeout: 12000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            return downloadBuffer(redirectUrl, headers).then(resolve);
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

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any> {
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
            ...headers,
          },
          timeout: 10000,
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

// Mapeamento explícito para candidatos prioritários / destacados / santinhos / campanhas
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
  // Talíria Petrone
  '190002536156': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  'dep_204464': 'https://www.camara.leg.br/internet/deputado/bandep/204464.jpg',
  // Jandira Feghali
  '190002543096': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  'dep_74848': 'https://www.camara.leg.br/internet/deputado/bandep/74848.jpg',
  // Henrique Vieira
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
  // Lula
  '280001607829': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  'pres_13': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg/500px-Foto_Oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28recorte%29.jpg',
  // Ciro Gomes
  '280001600167': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Ciro_Gomes_em_2022.jpg/500px-Ciro_Gomes_em_2022.jpg',
  'pres_12': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Ciro_Gomes_em_2022.jpg/500px-Ciro_Gomes_em_2022.jpg',
  // Leonardo Péricles
  '280001607830': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Leonardo_P%C3%A9ricles_em_2022.jpg/500px-Leonardo_P%C3%A9ricles_em_2022.jpg',
  'pres_80': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Leonardo_P%C3%A9ricles_em_2022.jpg/500px-Leonardo_P%C3%A9ricles_em_2022.jpg',
  // Sofia Manzano
  '280001607831': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sofia_Manzano_em_2022.jpg/500px-Sofia_Manzano_em_2022.jpg',
  'pres_21': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sofia_Manzano_em_2022.jpg/500px-Sofia_Manzano_em_2022.jpg',
  // Vera Lúcia
  '280001607832': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vera_L%C3%BAcia_em_2022.jpg/500px-Vera_L%C3%BAcia_em_2022.jpg',
  'pres_16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vera_L%C3%BAcia_em_2022.jpg/500px-Vera_L%C3%BAcia_em_2022.jpg',
};

async function main() {
  console.log('🚀 Iniciando enriquecimento massivo de fotos reais de candidatos e santinhos...');

  // 1. Aplicar mapeamento explícito prioritário
  console.log('\n[1/3] Sincronizando candidatos prioritários com fotos explícitas...');
  for (const [tseId, photoUrl] of Object.entries(EXPLICIT_CANDIDATE_PORTRAITS)) {
    const candidates = await prisma.candidate.findMany({
      where: { tseId },
    });

    if (candidates.length === 0) {
      console.log(`⚠️ Candidato com tseId ${tseId} não encontrado no banco.`);
      continue;
    }

    const buf = await downloadBuffer(photoUrl);
    if (!buf) {
      console.log(`⚠️ Falha ao baixar foto para ${tseId}: ${photoUrl}`);
      continue;
    }

    for (const cand of candidates) {
      savePhoto(cand.tseId, buf);
      await prisma.candidate.update({
        where: { id: cand.id },
        data: { photoUrl },
      });
      console.log(`✅ Foto salva para ${cand.name} (${cand.party} ${cand.state}, TSE: ${cand.tseId})`);
    }
  }

  // 2. Sincronizar deputados federais via API da Câmara
  console.log('\n[2/3] Sincronizando via API da Câmara dos Deputados...');
  const chamberData = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000&ordem=ASC&ordenarPor=nome');
  const deputies: any[] = chamberData?.dados || [];
  console.log(`Deputados obtidos da Câmara: ${deputies.length}`);

  let chamberMatched = 0;
  for (const dep of deputies) {
    const normDepName = normalize(dep.nome);
    if (!normDepName || !dep.urlFoto) continue;

    const matchedCandidates = await prisma.candidate.findMany({
      where: {
        name: { contains: dep.nome, mode: 'insensitive' },
      },
    });

    for (const cand of matchedCandidates) {
      const normCandName = normalize(cand.name);
      if (normCandName.includes(normDepName) || normDepName.includes(normCandName)) {
        const buf = await downloadBuffer(dep.urlFoto);
        if (buf) {
          savePhoto(cand.tseId, buf);
          await prisma.candidate.update({
            where: { id: cand.id },
            data: { photoUrl: dep.urlFoto },
          });
          chamberMatched++;
          console.log(`  🏛️ Câmara Match: ${cand.name} (${cand.party} ${cand.state})`);
        }
      }
    }
  }
  console.log(`✅ Total vinculados via Câmara: ${chamberMatched}`);

  // 3. Sincronizar via Wikipédia e portais públicos para candidatos RJ e de destaque
  console.log('\n[3/3] Enriquecendo candidatos RJ via busca de fotos públicas...');
  const rjCandidates = await prisma.candidate.findMany({
    where: { state: 'RJ' },
  });
  console.log(`Total candidatos RJ a verificar: ${rjCandidates.length}`);

  let wikiMatched = 0;
  for (const cand of rjCandidates) {
    const targetFile = path.resolve('apps/mobile/public/candidates', `${cand.tseId}.jpg`);
    if (fs.existsSync(targetFile) && cand.photoUrl) continue;

    // Busca por nome exato na Wikipédia
    const cleanName = cand.name.trim();
    const encoded = encodeURIComponent(cleanName);
    const wikiData = await getJson(
      `https://pt.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=600`
    );
    const pages = wikiData?.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as any;
      if (page?.thumbnail?.source) {
        const url = page.thumbnail.source;
        if (url.startsWith('http') && !url.includes('Replace_this_image') && !url.includes('Flag') && !url.includes('Coat_of_arms')) {
          const buf = await downloadBuffer(url);
          if (buf) {
            savePhoto(cand.tseId, buf);
            await prisma.candidate.update({
              where: { id: cand.id },
              data: { photoUrl: url },
            });
            wikiMatched++;
            console.log(`  🌐 Match Wikipédia: ${cand.name} -> ${url}`);
          }
        }
      }
    }
  }
  console.log(`✅ Total enriquecidos via Wikipédia: ${wikiMatched}`);

  // Estatísticas Finais
  const countWithPhoto = await prisma.candidate.count({
    where: { photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
  });
  const countRjWithPhoto = await prisma.candidate.count({
    where: { state: 'RJ', photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
  });
  console.log(`\n🎉 Sincronização concluída com sucesso!`);
  console.log(`  Candidatos gerais com foto no DB: ${countWithPhoto}`);
  console.log(`  Candidatos RJ com foto no DB: ${countRjWithPhoto}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
