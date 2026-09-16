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
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22William+Siri%22&srnamespace=6&format=json`;
  const res = await getJson(url);
  console.log('Search results for exact "William Siri":');
  console.log(JSON.stringify(res?.query?.search, null, 2));

  if (res?.query?.search?.[0]?.title) {
    const fileTitle = encodeURIComponent(res.query.search[0].title);
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${fileTitle}&prop=imageinfo&iiprop=url&format=json`;
    const infoRes = await getJson(infoUrl);
    console.log('Image info:', JSON.stringify(infoRes, null, 2));
  }
}

main().catch(console.error);
