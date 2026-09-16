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

function download(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https.get(
      url,
      {
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

const BADGES = {
  pt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Partido_dos_Trabalhadores_logo.svg/320px-Partido_dos_Trabalhadores_logo.svg.png',
  psol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Partido_Socialismo_e_Liberdade_logo.svg/320px-Partido_Socialismo_e_Liberdade_logo.svg.png',
  psb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Partido_Socialista_Brasileiro_logo.svg/320px-Partido_Socialista_Brasileiro_logo.svg.png',
  pcdob: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Partido_Comunista_do_Brasil_logo.svg/320px-Partido_Comunista_do_Brasil_logo.svg.png',
  pdt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Partido_Democr%C3%A1tico_Trabalhista_logo.svg/320px-Partido_Democr%C3%A1tico_Trabalhista_logo.svg.png',
  rede: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rede_Sustentabilidade_logo.svg/320px-Rede_Sustentabilidade_logo.svg.png',
  pv: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Partido_Verde_%28Brasil%29_logo.svg/320px-Partido_Verde_%28Brasil%29_logo.svg.png',
  up: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Unidade_Popular_logo.svg/320px-Unidade_Popular_logo.svg.png',
  pstu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Partido_Socialista_dos_Trabalhadores_Unificado_logo.svg/320px-Partido_Socialista_dos_Trabalhadores_Unificado_logo.svg.png',
  pcb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Partido_Comunista_Brasileiro_logo.svg/320px-Partido_Comunista_Brasileiro_logo.svg.png',
  pco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Partido_da_Causa_Oper%C3%A1ria_logo.svg/320px-Partido_da_Causa_Oper%C3%A1ria_logo.svg.png',
  cidadania: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cidadania_logo.svg/320px-Cidadania_logo.svg.png',
  solidariedade: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Solidariedade_%28partido_pol%C3%ADtico%29_logo.svg/320px-Solidariedade_%28partido_pol%C3%ADtico%29_logo.svg.png',
  psd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Partido_Social_Democr%C3%A1tico_%282011%29_logo.svg/320px-Partido_Social_Democr%C3%A1tico_%282011%29_logo.svg.png',
};

async function main() {
  for (const [k, url] of Object.entries(BADGES)) {
    const buf = await download(url);
    if (buf && buf.length > 500) {
      for (const d of TARGET_DIRS) {
        fs.writeFileSync(path.join(d, `party_${k}.png`), buf);
      }
      console.log(`Saved party_${k}.png (${buf.length} bytes)`);
    }
  }
}

main();
