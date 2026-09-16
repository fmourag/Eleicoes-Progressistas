import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function testTsePhoto(tseId: string, userAgent: string, method: string): Promise<{ status: number; len: number; type: string }> {
  return new Promise((resolve) => {
    const req = https.request(
      `https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto/2045202026/${tseId}`,
      {
        method,
        agent,
        headers: {
          'User-Agent': userAgent,
          Accept: 'image/jpeg,image/png,image/*;q=0.8',
          Referer: 'https://divulgacandcontas.tse.jus.br/',
        },
      },
      (res) => {
        let len = 0;
        res.on('data', (d) => (len += d.length));
        res.on('end', () =>
          resolve({
            status: res.statusCode || 0,
            len,
            type: String(res.headers['content-type'] || ''),
          })
        );
      }
    );
    req.on('error', () => resolve({ status: 500, len: 0, type: 'error' }));
    req.end();
  });
}

async function main() {
  // Adelson Guedes TSE ID and others
  const rjCands = [
    { name: 'Adelson Guedes', tseId: '190002534571' }, // we will find real tseId
  ];

  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'EleicoesProgressistas/2.2.3 (+https://eleicoes-progressistas.pages.dev)',
  ];

  for (const ua of uas) {
    const resGet = await testTsePhoto('190002536162', ua, 'GET');
    console.log(`UA: ${ua.substring(0, 30)}... | GET -> Status: ${resGet.status}, Len: ${resGet.len}, Type: ${resGet.type}`);
    const resHead = await testTsePhoto('190002536162', ua, 'HEAD');
    console.log(`UA: ${ua.substring(0, 30)}... | HEAD -> Status: ${resHead.status}, Len: ${resHead.len}, Type: ${resHead.type}`);
  }
}

main().catch(console.error);
