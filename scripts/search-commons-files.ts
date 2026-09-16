import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function getJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
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
          } catch (e) {
            resolve(null);
          }
        });
      }
    ).on('error', reject);
  });
}

async function main() {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=William+Siri&srnamespace=6&format=json`;
  const res = await getJson(url);
  console.log('Search results for William Siri in Commons File namespace:');
  console.log(JSON.stringify(res?.query?.search, null, 2));

  const url2 = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=Luan+Monteiro&srnamespace=6&format=json`;
  const res2 = await getJson(url2);
  console.log('Search results for Luan Monteiro:');
  console.log(JSON.stringify(res2?.query?.search, null, 2));

  const url3 = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=Monica+Benicio&srnamespace=6&format=json`;
  const res3 = await getJson(url3);
  console.log('Search results for Monica Benicio:');
  console.log(JSON.stringify(res3?.query?.search, null, 2));
}

main().catch(console.error);
