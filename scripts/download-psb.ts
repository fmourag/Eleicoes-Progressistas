import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const agent = new https.Agent({ rejectUnauthorized: false });

const TARGET_DIRS = [
  path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
  path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
  path.resolve(process.cwd(), 'apps/api/public/candidates'),
];

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

async function main() {
  const searchRes = await getJson(
    'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=PSB%2040%20logo&srnamespace=6&format=json'
  );
  console.log(searchRes?.query?.search);
  const title = searchRes?.query?.search?.[0]?.title || 'File:Logotipo do Partido Socialista Brasileiro.svg';
  const info = await getJson(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json`
  );
  const pages = info?.query?.pages;
  const pageId = Object.keys(pages || {})[0];
  const thumbUrl = pages?.[pageId]?.imageinfo?.[0]?.thumburl || pages?.[pageId]?.imageinfo?.[0]?.url;
  if (thumbUrl) {
    const buf = await download(thumbUrl);
    if (buf) {
      for (const d of TARGET_DIRS) {
        fs.writeFileSync(path.join(d, 'party_psb.png'), buf);
      }
      console.log(`✅ Saved party_psb.png (${buf.length} bytes)`);
    }
  }
}

main();
