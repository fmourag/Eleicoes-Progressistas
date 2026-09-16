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

async function searchCommons(query: string): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
  const data = await getJson(url);
  const pages = data?.query?.pages;
  if (pages) {
    for (const pid of Object.keys(pages)) {
      const info = pages[pid]?.imageinfo?.[0];
      if (info?.url) {
        return info.url;
      }
    }
  }
  return null;
}

async function searchWiki(query: string): Promise<string | null> {
  const url = `https://pt.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=3&prop=pageimages&pithumbsize=500&format=json`;
  const data = await getJson(url);
  const pages = data?.query?.pages;
  if (pages) {
    for (const pid of Object.keys(pages)) {
      const thumb = pages[pid]?.thumbnail?.source;
      if (thumb) {
        return thumb;
      }
    }
  }
  return null;
}

async function main() {
  const queries = [
    'William Siri',
    '190002536162',
    'Luan Monteiro PCO',
    '190002552513',
    'Mônica Benício',
    '190002536164',
    'Paula Falcão PSTU',
    'Michelly Xavier UP',
    'Luiz Eugênio Honorato PCO',
    'Vinícius Benevides UP',
  ];

  for (const q of queries) {
    const commons = await searchCommons(q);
    const wiki = await searchWiki(q);
    console.log(`Query "${q}":`);
    console.log(`  Commons: ${commons}`);
    console.log(`  Wiki: ${wiki}`);
  }
}

main().catch(console.error);
