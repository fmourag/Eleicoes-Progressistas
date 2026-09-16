import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function testTseCandidate(uf: string, tseId: string): Promise<any> {
  return new Promise((resolve) => {
    https.get(
      `https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/2026/${uf}/2045202026/candidato/${tseId}`,
      {
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://divulgacandcontas.tse.jus.br/',
        },
      },
      (res) => {
        let b = '';
        res.on('data', (d) => (b += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(b) });
          } catch (e) {
            resolve({ status: res.statusCode, data: b });
          }
        });
      }
    ).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function main() {
  const res = await testTseCandidate('RJ', '190002536162');
  console.log('TSE Candidate Data: Status', res.status);
  if (res.data) {
    console.log('Keys:', typeof res.data === 'object' ? Object.keys(res.data) : res.data);
    if (res.data.fotoUrl || res.data.foto || res.data.urlFoto) {
      console.log('Foto field found:', res.data.fotoUrl || res.data.foto || res.data.urlFoto);
    }
  }
}

main().catch(console.error);
