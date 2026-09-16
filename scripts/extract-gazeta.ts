import * as https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function getNextData(url: string) {
  return new Promise<void>((resolve) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            console.log(url, `REDIRECT -> ${redirectUrl}`);
            return getNextData(redirectUrl).then(resolve);
          }
          let html = '';
          res.on('data', (c) => (html += c));
          res.on('end', () => {
            const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
            if (nextMatch) {
              try {
                const data = JSON.parse(nextMatch[1]);
                console.log(url, 'FOUND NEXT DATA keys:', Object.keys(data.props?.pageProps || {}));
                console.log('Props sample:', JSON.stringify(data.props?.pageProps || {}).slice(0, 500));
              } catch (e: any) {
                console.log(url, 'JSON parse err:', e.message);
              }
            } else {
              console.log(url, 'NO NEXT DATA, Status:', res.statusCode);
            }
            resolve();
          });
        }
      )
      .on('error', () => resolve());
  });
}

async function main() {
  await getNextData('https://www.gazetadopovo.com.br/eleicoes/2022/rj/pratinha-deputado-federal-4090/');
  await getNextData('https://www.gazetadopovo.com.br/eleicoes/2022/rj/toninho-bondade-deputado-federal-1225/');
  await getNextData('https://www.gazetadopovo.com.br/eleicoes/2022/rj/dr-lobao-deputado-federal-1344/');
}

main();
