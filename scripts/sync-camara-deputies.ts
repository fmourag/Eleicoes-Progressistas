import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();
const agent = new https.Agent({ rejectUnauthorized: false });

function getJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        },
        (res) => {
          let b = '';
          res.on('data', (d) => (b += d));
          res.on('end', () => {
            try {
              resolve(JSON.parse(b));
            } catch (e) {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => resolve(null));
  });
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Accept: 'image/jpeg,image/png,image/*;q=0.8',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return downloadBuffer(res.headers.location).then(resolve);
          }
          if (res.statusCode !== 200) {
            return resolve(null);
          }
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            resolve(buf.length > 500 ? buf : null);
          });
          res.on('error', () => resolve(null));
        }
      )
      .on('error', () => resolve(null));
  });
}

function normalize(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function main() {
  console.log('🏛️ Buscando todos os 513 Deputados Federais da Câmara dos Deputados...');

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const camaraData = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=57&itens=1000');
  const deputies = camaraData?.dados || [];
  console.log(`✅ Recebidos ${deputies.length} deputados da Câmara.`);

  const dbFederal = await prisma.candidate.findMany({
    where: { cargo: { in: ['DEPUTADO_FEDERAL', 'SENADOR', 'GOVERNADOR'] } },
    select: { id: true, tseId: true, name: true, state: true, party: true, photoUrl: true },
  });
  console.log(`🔍 Comparando com ${dbFederal.length} candidatos federais no banco...`);

  let matchedCount = 0;

  for (const dep of deputies) {
    const normDepName = normalize(dep.nome);
    const matched = dbFederal.filter((c) => {
      const normCandName = normalize(c.name);
      return (
        normCandName === normDepName ||
        normCandName.includes(normDepName) ||
        normDepName.includes(normCandName) ||
        (normDepName.split(' ').length >= 2 && normCandName.startsWith(normDepName))
      );
    });

    if (matched.length > 0 && dep.urlFoto) {
      console.log(`🎯 Match: ${dep.nome} (${dep.siglaUf}) -> ${matched.map((m) => `${m.name} [${m.tseId}]`).join(', ')}`);
      const buf = await downloadBuffer(dep.urlFoto);
      if (buf) {
        for (const m of matched) {
          for (const dir of targetDirs) {
            fs.writeFileSync(path.join(dir, `${m.tseId}.jpg`), buf);
            fs.writeFileSync(path.join(dir, `tse_${m.tseId}.jpg`), buf);
            fs.writeFileSync(path.join(dir, `dep_${dep.id}.jpg`), buf);
          }
          await prisma.candidate.updateMany({
            where: { id: m.id },
            data: { photoUrl: dep.urlFoto },
          });
          matchedCount++;
        }
      }
    }
  }

  console.log(`🎉 Total de Deputados Federais sincronizados com fotos oficiais da Câmara: ${matchedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
