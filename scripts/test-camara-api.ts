import * as https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

function getJson(url: string): Promise<any> {
  return new Promise((resolve) => {
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
          } catch {
            resolve(null);
          }
        });
      }
    ).on('error', () => resolve(null));
  });
}

async function main() {
  // Test Chamber 57 (current) and 56 (previous)
  const l57 = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=57&itens=1000');
  console.log('Chamber Legislature 57 count:', l57?.dados?.length);

  const l56 = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=56&itens=1000');
  console.log('Chamber Legislature 56 count:', l56?.dados?.length);

  // Test Senate current and previous
  const sen = await getJson('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json');
  console.log('Senate count:', sen?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar?.length);

  // Sample RJ deputies in Legislature 57
  const rjDeps = (l57?.dados || []).filter((d: any) => d.siglaUf === 'RJ');
  console.log('RJ Chamber L57 count:', rjDeps.length);
  console.log('Sample RJ L57:', rjDeps.slice(0, 5));
}

main();
