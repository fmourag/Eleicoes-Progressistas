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

const SEARCH_PARTIES = {
  pstu: 'PSTU logo',
  pcb: 'Partido Comunista Brasileiro logo',
  pco: 'Partido da Causa Operária logo',
  cidadania: 'Cidadania23 logo',
  solidariedade: 'Solidariedade logo brasil',
  psd: 'Partido Social Democrático logo',
  agir: 'Agir 36 logo',
  pmb: 'Partido da Mulher Brasileira logo',
  mobiliza: 'Mobiliza 33 logo',
  avante: 'Avante 70 logo',
  mdb: 'MDB logo brasil',
};

async function main() {
  for (const [k, query] of Object.entries(SEARCH_PARTIES)) {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&srnamespace=6&format=json`;
    const searchRes = await getJson(searchUrl);
    const firstResult = searchRes?.query?.search?.[0]?.title;
    if (firstResult) {
      console.log(`Found for ${k}: ${firstResult}`);
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        firstResult
      )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json`;
      const infoRes = await getJson(infoUrl);
      const pages = infoRes?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const thumbUrl = pages[pageId]?.imageinfo?.[0]?.thumburl || pages[pageId]?.imageinfo?.[0]?.url;
        if (thumbUrl) {
          const buf = await download(thumbUrl);
          if (buf && buf.length > 200) {
            for (const d of TARGET_DIRS) {
              fs.writeFileSync(path.join(d, `party_${k}.png`), buf);
            }
            console.log(`✅ Saved party_${k}.png (${buf.length} bytes)`);
          }
        }
      }
    }
  }
}

main();
