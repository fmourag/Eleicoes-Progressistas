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

const WIKI_PARTY_TITLES: Record<string, string> = {
  pt: 'Partido dos Trabalhadores',
  psol: 'Partido Socialismo e Liberdade',
  psb: 'Partido Socialista Brasileiro',
  pcdob: 'Partido Comunista do Brasil',
  pdt: 'Partido Democrático Trabalhista',
  pv: 'Partido Verde (Brasil)',
  rede: 'Rede Sustentabilidade',
  up: 'Unidade Popular (Brasil)',
  pstu: 'Partido Socialista dos Trabalhadores Unificado',
  pcb: 'Partido Comunista Brasileiro',
  pco: 'Partido da Causa Operária',
  cidadania: 'Cidadania (partido político)',
  solidariedade: 'Solidariedade (partido político)',
  psd: 'Partido Social Democrático (2011)',
  agir: 'Agir (partido político)',
  pmb: 'Partido da Mulher Brasileira',
  mobiliza: 'Mobiliza (partido político)',
  avante: 'Avante (partido político)',
  mdb: 'Movimento Democrático Brasileiro (1980)',
};

async function main() {
  const titles = Object.values(WIKI_PARTY_TITLES).join('|');
  const apiUrl = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    titles
  )}&prop=pageimages&pithumbsize=500&format=json`;

  const json = await getJson(apiUrl);
  const pages = json?.query?.pages || {};

  for (const [key, articleTitle] of Object.entries(WIKI_PARTY_TITLES)) {
    const page = Object.values(pages).find((p: any) => p.title.toLowerCase() === articleTitle.toLowerCase()) as any;
    if (page?.thumbnail?.source) {
      const src = page.thumbnail.source;
      console.log(`Downloading ${key} from ${src}`);
      const buf = await download(src);
      if (buf && buf.length > 500) {
        for (const dir of TARGET_DIRS) {
          fs.writeFileSync(path.join(dir, `party_${key}.png`), buf);
        }
        console.log(`✅ Saved party_${key}.png (${buf.length} bytes)`);
      }
    } else {
      console.log(`No thumbnail found for ${articleTitle}`);
    }
  }
}

main();
