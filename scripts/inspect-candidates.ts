import https from 'https';
import http from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

function fetchBuffer(url: string): Promise<{ status: number; contentType?: string; buffer: Buffer }> {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    client.get(
      url,
      {
        agent: isHttps ? agent : undefined,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(res.headers.location).then(resolve);
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () =>
          resolve({
            status: res.statusCode || 0,
            contentType: res.headers['content-type'],
            buffer: Buffer.concat(chunks),
          })
        );
        res.on('error', () => resolve({ status: 500, buffer: Buffer.from([]) }));
      }
    ).on('error', () => resolve({ status: 500, buffer: Buffer.from([]) }));
  });
}

async function searchWikimediaPhoto(query: string): Promise<string | null> {
  const endpoint = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=500`;
  const res = await fetchBuffer(endpoint);
  if (res.status === 200) {
    try {
      const data = JSON.parse(res.buffer.toString('utf-8'));
      const pages = data?.query?.pages;
      if (pages) {
        for (const pid of Object.keys(pages)) {
          const thumb = pages[pid]?.thumbnail?.source;
          if (thumb) return thumb;
        }
      }
    } catch (e) {}
  }
  return null;
}

async function main() {
  const rjCands = await prisma.candidate.findMany({
    where: { state: 'RJ', cargo: { in: ['GOVERNADOR', 'SENADOR'] } },
  });

  console.log('--- TESTANDO CANDIDATOS RJ ---');
  for (const c of rjCands) {
    const tsePhotoUrl = `https://divulgacandcontas.tse.jus.br/divulgacand/rest/v1/candidatura/buscar/foto/2045202026/${c.tseId}`;
    const tseRes = await fetchBuffer(tsePhotoUrl);
    const wikiPhoto = await searchWikimediaPhoto(c.name);
    console.log(`[${c.cargo}] ${c.name} (${c.tseId})`);
    console.log(`  - TSE 2026: HTTP ${tseRes.status}, ${tseRes.buffer.length} bytes, type: ${tseRes.contentType}`);
    console.log(`  - Wiki Photo: ${wikiPhoto}`);
  }
}

main().finally(() => prisma.$disconnect());
