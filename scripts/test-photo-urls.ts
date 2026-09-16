import * as https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const urlsToTest = [
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RJ_div.zip',
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_BR_div.zip',
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RJ_div.zip',
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2022/fotos/foto_cand2022_RJ_div.zip',
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2022/fotos/foto_cand2022_BR_div.zip',
  'https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto/2045202026/190002543089',
  'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/foto/2026/RJ/190002543089',
  'https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome',
];

async function checkUrl(url: string) {
  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: 'HEAD',
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: '*/*',
        },
        timeout: 8000,
      },
      (res) => {
        resolve({ url, status: res.statusCode, length: res.headers['content-length'] });
      }
    );
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, error: 'TIMEOUT' });
    });
    req.end();
  });
}

async function main() {
  console.log('Testing URLs...');
  for (const u of urlsToTest) {
    const res = await checkUrl(u);
    console.log(res);
  }
}

main();
