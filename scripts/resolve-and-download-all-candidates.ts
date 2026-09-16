import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

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
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    client
      .get(
        url,
        {
          agent: isHttps ? agent : undefined,
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
            // Verify magic bytes
            if (isValidImage(buf)) {
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

function isValidImage(buf: Buffer): boolean {
  if (!buf || buf.length < 500) return false;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WEBP
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return true;
  }
  return false;
}

async function findCommonsPhoto(query: string): Promise<string | null> {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&srnamespace=6&format=json&srlimit=5`;
  const data = await getJson(searchUrl);
  const results = data?.query?.search;
  if (!results || results.length === 0) return null;

  for (const item of results) {
    const title = item.title;
    const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=imageinfo&iiprop=url&format=json`;
    const fileData = await getJson(fileUrl);
    const pages = fileData?.query?.pages;
    if (pages) {
      for (const pid of Object.keys(pages)) {
        const url = pages[pid]?.imageinfo?.[0]?.url;
        if (url && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.includes('.jpg?') || url.includes('.jpeg?') || url.includes('.png?'))) {
          return url;
        }
      }
    }
  }
  return null;
}

async function findWikipediaPhoto(title: string): Promise<string | null> {
  const url = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    title
  )}&prop=pageimages&pithumbsize=500&format=json`;
  const data = await getJson(url);
  const pages = data?.query?.pages;
  if (pages) {
    for (const pid of Object.keys(pages)) {
      const src = pages[pid]?.thumbnail?.source;
      if (src) return src;
    }
  }
  return null;
}

const KNOWN_EXACT_PHOTOS: Record<string, string> = {
  // RJ Governador & Senador
  '190002536162': 'https://upload.wikimedia.org/wikipedia/commons/0/05/2026_WILLIAM_SIRI_CANDIDATO_GOVERNADOR_TSE_RJ_%28190002536162%29.jpg',
  'gov_rj_siri': 'https://upload.wikimedia.org/wikipedia/commons/0/05/2026_WILLIAM_SIRI_CANDIDATO_GOVERNADOR_TSE_RJ_%28190002536162%29.jpg',
  '190002552513': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Luan_Monteiro_PCO.jpg/500px-Luan_Monteiro_PCO.jpg',
  '190002536164': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/M%C3%B4nica_Ben%C3%ADcio_%2849234235991%29_%28cropped_2%29.jpg/500px-M%C3%B4nica_Ben%C3%ADcio_%2849234235991%29_%28cropped_2%29.jpg',
  '190002539827': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Paula_Falc%C3%A3o_PSTU.jpg/500px-Paula_Falc%C3%A3o_PSTU.jpg',
  '190002548589': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Michelly_Xavier_UP.jpg/500px-Michelly_Xavier_UP.jpg',
  '190002552521': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Luiz_Eug%C3%AAnio_Honorato_PCO.jpg/500px-Luiz_Eug%C3%AAnio_Honorato_PCO.jpg',
  '190002548590': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Vinicius_Benevides_UP.jpg/500px-Vinicius_Benevides_UP.jpg',

  // SP
  '250002551501': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Marina_Silva_%282023%29.jpg/500px-Marina_Silva_%282023%29.jpg',
  '250002551502': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Simone_Tebet_%28foto_oficial%29.jpg/500px-Simone_Tebet_%28foto_oficial%29.jpg',
  '250002544516': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Ma%C3%ADra_Dias_UP.jpg/500px-Ma%C3%ADra_Dias_UP.jpg',
  '250002544514': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/M%C3%A1rcio_Alves_UP.jpg/500px-M%C3%A1rcio_Alves_UP.jpg',
  '250002541362': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Eliana_Ferreira_PSTU.jpg/500px-Eliana_Ferreira_PSTU.jpg',
  '250002541365': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Weller_Gon%C3%A7alves_PSTU.jpg/500px-Weller_Gon%C3%A7alves_PSTU.jpg',
  '250002552153': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Petter_Maahs_PCB.jpg/500px-Petter_Maahs_PCB.jpg',
  '250002552955': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Ednelson_Cesaretti_PCO.jpg/500px-Ednelson_Cesaretti_PCO.jpg',

  // RS
  '210002533581': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Manuela_d%27%C3%81vila_em_2022_%28cropped%29.jpg/500px-Manuela_d%27%C3%81vila_em_2022_%28cropped%29.jpg',
  '210002533584': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Paulo_Pimenta_2023.jpg/500px-Paulo_Pimenta_2023.jpg',
  '210002533435': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Luciano_Schafer_UP.jpg/500px-Luciano_Schafer_UP.jpg',
  '210002533434': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Tania_Santoro_UP.jpg/500px-Tania_Santoro_UP.jpg',

  // BA
  'gov_ba_jeronimo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg/500px-18_01_2023_-_Visita_de_Cortesia_Jer%C3%B4nimo_Rodrigues_%28Governador_do_Estado_da_Bahia-BA%29_%2852635213362%29_%28cropped%29.jpg',

  // CE
  'gov_ce_elmano': 'https://www.camara.leg.br/internet/deputado/bandep/204554.jpg',

  // RN
  'gov_rn_fatima': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/F%C3%A1tima_Bezerra%2C_2023.jpg/500px-F%C3%A1tima_Bezerra%2C_2023.jpg',

  // PB
  'gov_pb_azevedo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg/500px-Jo%C3%A3o_Azev%C3%AAdo%2C_May_2023_%28cropped%29.jpg',

  // PI
  'gov_pi_rafael': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rafael_Fonteles_%28Foto_Oficial%29.jpg/500px-Rafael_Fonteles_%28Foto_Oficial%29.jpg',

  // MA
  'gov_ma_brandao': 'https://www.camara.leg.br/internet/deputado/bandep/141408.jpg',

  // ES
  'gov_es_casagrande': 'https://www.senado.leg.br/senadores/img/fotos-oficiais/4525.jpg',

  // AP
  'gov_ap_clecio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg/500px-Cl%C3%A9cio_Lu%C3%ADs_em_2023.jpg',
};

async function main() {
  console.log('🚀 Iniciando Resolução Global de Fotos de Candidatos...');

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // 1. Process explicit known exact photos
  for (const [tseId, url] of Object.entries(KNOWN_EXACT_PHOTOS)) {
    console.log(`📥 Processando foto conhecida para TSE ${tseId}...`);
    try {
      const buffer = await downloadBuffer(url);
      if (buffer) {
        for (const dir of targetDirs) {
          fs.writeFileSync(path.join(dir, `${tseId}.jpg`), buffer);
          fs.writeFileSync(path.join(dir, `tse_${tseId}.jpg`), buffer);
        }
        await prisma.candidate.updateMany({
          where: { tseId },
          data: { photoUrl: url },
        });
        console.log(`✅ [SUCESSO] Foto gravada para ${tseId} (${buffer.length} bytes)`);
      } else {
        console.warn(`⚠️ Não foi possível baixar ${url} para ${tseId}`);
      }
    } catch (e: any) {
      console.warn(`Erro para ${tseId}: ${e.message}`);
    }
  }

  // 2. Resolve missing photos for all major candidates (Presidente, Governador, Senador)
  const majorCandidates = await prisma.candidate.findMany({
    where: {
      cargo: { in: ['PRESIDENTE', 'GOVERNADOR', 'SENADOR'] },
    },
  });

  console.log(`🔍 Verificando ${majorCandidates.length} candidatos majoritários no Brasil...`);

  for (const cand of majorCandidates) {
    const localFile = path.join(targetDirs[0], `${cand.tseId}.jpg`);
    const hasLocal = fs.existsSync(localFile) && fs.statSync(localFile).size > 1000;

    if (hasLocal && cand.photoUrl && !cand.photoUrl.includes('placeholder')) {
      continue;
    }

    console.log(`🔎 Buscando foto para: ${cand.name} (${cand.cargo} - ${cand.state} - ${cand.party} - ${cand.tseId})...`);

    let foundUrl: string | null = null;

    // Search Commons by TSE ID
    if (cand.tseId && /^\d+$/.test(cand.tseId)) {
      foundUrl = await findCommonsPhoto(cand.tseId);
    }

    // Search Commons by Name
    if (!foundUrl) {
      foundUrl = await findCommonsPhoto(cand.name);
    }

    // Search Wikipedia
    if (!foundUrl) {
      foundUrl = await findWikipediaPhoto(cand.name);
    }

    if (foundUrl) {
      console.log(`  🎯 Encontrada foto: ${foundUrl}`);
      const buf = await downloadBuffer(foundUrl);
      if (buf) {
        for (const dir of targetDirs) {
          fs.writeFileSync(path.join(dir, `${cand.tseId}.jpg`), buf);
          fs.writeFileSync(path.join(dir, `tse_${cand.tseId}.jpg`), buf);
        }
        await prisma.candidate.updateMany({
          where: { id: cand.id },
          data: { photoUrl: foundUrl },
        });
        console.log(`  ✅ Gravado com sucesso para ${cand.name}`);
      }
    } else {
      console.log(`  ❌ Nenhuma foto encontrada nos repositórios para ${cand.name}`);
    }
  }

  console.log('🎉 Resolução e empacotamento concluídos!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
