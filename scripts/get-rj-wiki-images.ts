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
  const url = `https://pt.wikipedia.org/w/api.php?action=query&titles=Elei%C3%A7%C3%B5es_estaduais_no_Rio_de_Janeiro_em_2026&prop=images&imlimit=50&format=json`;
  const res = await getJson(url);
  const images = res?.query?.pages?.['7860890']?.images;
  console.log('All images in Eleições estaduais no Rio de Janeiro em 2026:');
  console.log(JSON.stringify(images, null, 2));
}

main().catch(console.error);
