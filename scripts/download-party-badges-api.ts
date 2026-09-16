import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const agent = new https.Agent({ rejectUnauthorized: false });

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
    https.get(
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
          } catch {
            resolve(null);
          }
        });
      }
    ).on('error', () => resolve(null));
  });
}

function download(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https.get(
      url,
      {
        agent,
        headers: {
          'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
          Accept: 'image/png,image/jpeg,image/webp,image/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve);
        }
        if (res.statusCode !== 200) {
          console.log(`Status ${res.statusCode} for ${url}`);
          return resolve(null);
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', () => resolve(null));
      }
    ).on('error', () => resolve(null));
  });
}

const PARTY_COMMONS_FILES = {
  pt: 'File:Partido dos Trabalhadores logo.svg',
  psol: 'File:Partido Socialismo e Liberdade logo.svg',
  psb: 'File:Partido Socialista Brasileiro logo.svg',
  pcdob: 'File:Partido Comunista do Brasil logo.svg',
  pdt: 'File:Partido Democrático Trabalhista logo.svg',
  rede: 'File:Rede Sustentabilidade logo.svg',
  pv: 'File:Partido Verde (Brasil) logo.svg',
  up: 'File:Unidade Popular logo.svg',
  pstu: 'File:Partido Socialista dos Trabalhadores Unificado logo.svg',
  pcb: 'File:Partido Comunista Brasileiro logo.svg',
  pco: 'File:Partido da Causa Operária logo.svg',
  cidadania: 'File:Cidadania logo.svg',
  solidariedade: 'File:Solidariedade (partido político) logo.svg',
  psd: 'File:Partido Social Democrático (2011) logo.svg',
  agir: 'File:Agir logo.svg',
  pmb: 'File:Partido da Mulher Brasileira logo.svg',
  mobiliza: 'File:Mobiliza logo.svg',
  avante: 'File:Avante logo.svg',
  pode: 'File:Podemos (Brasil) logo.svg',
  mdb: 'File:Movimento Democrático Brasileiro (1980) logo.svg',
};

async function main() {
  for (const [k, fileTitle] of Object.entries(PARTY_COMMONS_FILES)) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      fileTitle
    )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json`;
    const json = await getJson(apiUrl);
    const pages = json?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const thumbUrl = pages[pageId]?.imageinfo?.[0]?.thumburl || pages[pageId]?.imageinfo?.[0]?.url;
      if (thumbUrl) {
        console.log(`Downloading ${k} from ${thumbUrl}`);
        const buf = await download(thumbUrl);
        if (buf && buf.length > 200) {
          for (const d of TARGET_DIRS) {
            fs.writeFileSync(path.join(d, `party_${k}.png`), buf);
          }
          console.log(`✅ Saved party_${k}.png (${buf.length} bytes)`);
        }
      } else {
        console.log(`No thumburl found for ${fileTitle}`);
      }
    }
  }
}

main();
