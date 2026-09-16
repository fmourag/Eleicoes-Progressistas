import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function getJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
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
      .on('error', reject);
  });
}

async function main() {
  const url = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=Elei%C3%A7%C3%B5es+estaduais+no+Rio+de+Janeiro+2026&format=json`;
  const res = await getJson(url);
  console.log('Wikipedia Search:');
  console.log(JSON.stringify(res?.query?.search, null, 2));
}

main().catch(console.error);
