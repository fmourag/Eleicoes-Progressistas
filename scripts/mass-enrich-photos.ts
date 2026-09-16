import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const TARGET_DIRS = [
  path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
  path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
  path.resolve(process.cwd(), 'apps/api/public/candidates'),
];

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalize(str?: string | null): string {
  if (!str) return '';
  return str
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ');
}

function downloadBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          },
          timeout: 10000,
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
            if (buf.length > 500) {
              resolve(buf);
            } else {
              resolve(null);
            }
          });
          res.on('error', () => resolve(null));
        }
      )
      .on('error', () => resolve(null))
      .on('timeout', () => resolve(null));
  });
}

function getJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          agent: httpsAgent,
          headers: {
            'User-Agent': 'EleicoesProgressistas/2.2.3 (contato@eleicoesprogressistas.org)',
            Accept: 'application/json',
          },
          timeout: 10000,
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
      )
      .on('error', () => resolve(null))
      .on('timeout', () => resolve(null));
  });
}

function savePhoto(key: string, buffer: Buffer) {
  for (const dir of TARGET_DIRS) {
    fs.writeFileSync(path.join(dir, `${key}.jpg`), buffer);
    fs.writeFileSync(path.join(dir, `tse_${key}.jpg`), buffer);
  }
}

function savePartyBadge(partyKey: string, buffer: Buffer) {
  for (const dir of TARGET_DIRS) {
    fs.writeFileSync(path.join(dir, `party_${partyKey}.png`), buffer);
  }
}

const PARTY_BADGES: Record<string, string> = {
  pt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Partido_dos_Trabalhadores_logo.svg/500px-Partido_dos_Trabalhadores_logo.svg.png',
  psol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Partido_Socialismo_e_Liberdade_logo.svg/500px-Partido_Socialismo_e_Liberdade_logo.svg.png',
  psb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Partido_Socialista_Brasileiro_logo.svg/500px-Partido_Socialista_Brasileiro_logo.svg.png',
  pcdob: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Partido_Comunista_do_Brasil_logo.svg/500px-Partido_Comunista_do_Brasil_logo.svg.png',
  pdt: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Partido_Democr%C3%A1tico_Trabalhista_logo.svg/500px-Partido_Democr%C3%A1tico_Trabalhista_logo.svg.png',
  rede: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rede_Sustentabilidade_logo.svg/500px-Rede_Sustentabilidade_logo.svg.png',
  pv: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Partido_Verde_%28Brasil%29_logo.svg/500px-Partido_Verde_%28Brasil%29_logo.svg.png',
  up: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Unidade_Popular_logo.svg/500px-Unidade_Popular_logo.svg.png',
  pstu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Partido_Socialista_dos_Trabalhadores_Unificado_logo.svg/500px-Partido_Socialista_dos_Trabalhadores_Unificado_logo.svg.png',
  pcb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Partido_Comunista_Brasileiro_logo.svg/500px-Partido_Comunista_Brasileiro_logo.svg.png',
  pco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Partido_da_Causa_Oper%C3%A1ria_logo.svg/500px-Partido_da_Causa_Oper%C3%A1ria_logo.svg.png',
  cidadania: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cidadania_logo.svg/500px-Cidadania_logo.svg.png',
  solidariedade: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Solidariedade_%28partido_pol%C3%ADtico%29_logo.svg/500px-Solidariedade_%28partido_pol%C3%ADtico%29_logo.svg.png',
  psd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Partido_Social_Democr%C3%A1tico_%282011%29_logo.svg/500px-Partido_Social_Democr%C3%A1tico_%282011%29_logo.svg.png',
  agir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Agir_logo.svg/500px-Agir_logo.svg.png',
  pmb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Partido_da_Mulher_Brasileira_logo.svg/500px-Partido_da_Mulher_Brasileira_logo.svg.png',
  mobiliza: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Mobiliza_logo.svg/500px-Mobiliza_logo.svg.png',
  avante: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Avante_logo.svg/500px-Avante_logo.svg.png',
  pode: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Podemos_%28Brasil%29_logo.svg/500px-Podemos_%28Brasil%29_logo.svg.png',
  mdb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Movimento_Democr%C3%A1tico_Brasileiro_%281980%29_logo.svg/500px-Movimento_Democr%C3%A1tico_Brasileiro_%281980%29_logo.svg.png',
};

async function main() {
  console.log('🌟 [1/3] Baixando Badges Oficiais dos Partidos...');
  for (const [partyKey, badgeUrl] of Object.entries(PARTY_BADGES)) {
    try {
      const buf = await downloadBuffer(badgeUrl);
      if (buf) {
        savePartyBadge(partyKey, buf);
        console.log(`  ✅ Badge ${partyKey.toUpperCase()} salvo com sucesso (${buf.length} bytes)`);
      }
    } catch (e: any) {
      console.warn(`  ⚠️ Falha ao baixar badge ${partyKey}: ${e.message}`);
    }
  }

  console.log('\n🌟 [2/3] Buscando Deputados da Câmara (Legislaturas 57 e 56)...');
  const allCandidates = await prisma.candidate.findMany({
    select: { id: true, tseId: true, name: true, party: true, state: true, cargo: true, photoUrl: true },
  });
  console.log(`Total de candidatos no banco de dados: ${allCandidates.length}`);

  const l57 = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=57&itens=1000');
  const l56 = await getJson('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=56&itens=1000');
  const chamberDeps: any[] = [...(l57?.dados || []), ...(l56?.dados || [])];
  console.log(`Total de registros da Câmara carregados: ${chamberDeps.length}`);

  let matchedChamberCount = 0;

  for (const dep of chamberDeps) {
    if (!dep.urlFoto || !dep.nome) continue;
    const normDepName = normalize(dep.nome);
    const depUf = dep.siglaUf;
    const depPhoto = dep.urlFoto;

    // Procura match entre candidatos
    const matches = allCandidates.filter((cand) => {
      const normCandName = normalize(cand.name);
      if (cand.state && depUf && cand.state !== depUf) return false;
      
      if (normCandName === normDepName) return true;
      if (normCandName.includes(normDepName) || normDepName.includes(normCandName)) {
        return normDepName.length >= 8;
      }
      
      const depTokens = normDepName.split(' ');
      const candTokens = normCandName.split(' ');
      if (depTokens.length >= 2 && candTokens.length >= 2) {
        if (depTokens[0] === candTokens[0] && depTokens[depTokens.length - 1] === candTokens[candTokens.length - 1]) {
          return true;
        }
      }
      return false;
    });

    for (const match of matches) {
      if (!match.photoUrl || match.photoUrl === '' || match.photoUrl.startsWith('/candidates')) {
        console.log(`  🎯 Match Câmara: ${match.name} (${match.state}, ${match.party}, TSE: ${match.tseId}) -> ${dep.nome}`);
        const buf = await downloadBuffer(depPhoto);
        if (buf) {
          savePhoto(match.tseId, buf);
          await prisma.candidate.update({
            where: { id: match.id },
            data: { photoUrl: depPhoto },
          });
          match.photoUrl = depPhoto;
          matchedChamberCount++;
        }
      }
    }
  }

  console.log(`✅ Total de fotos sincronizadas via Câmara dos Deputados: ${matchedChamberCount}`);

  console.log('\n🌟 [3/3] Enriquecimento Direto de Candidatos RJ & Lideranças Nacionais...');
  const rjCandidates = allCandidates.filter((c) => c.state === 'RJ');
  console.log(`Total candidatos RJ: ${rjCandidates.length}`);

  // Para candidatos RJ que ainda não têm foto, tentamos busca rápida na Wikipédia
  let wikiCount = 0;
  for (const cand of rjCandidates) {
    if (cand.photoUrl && cand.photoUrl.startsWith('http')) continue;

    const cleanName = cand.name.trim();
    const encoded = encodeURIComponent(cleanName);
    const wikiData = await getJson(`https://pt.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=500`);
    const pages = wikiData?.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as any;
      if (page?.thumbnail?.source) {
        const url = page.thumbnail.source;
        if (url.startsWith('http') && !url.includes('Replace_this_image')) {
          console.log(`  🎯 Match Wikipédia RJ: ${cand.name} -> ${url}`);
          const buf = await downloadBuffer(url);
          if (buf) {
            savePhoto(cand.tseId, buf);
            await prisma.candidate.update({
              where: { id: cand.id },
              data: { photoUrl: url },
            });
            cand.photoUrl = url;
            wikiCount++;
          }
        }
      }
    }
  }

  console.log(`✅ Total de fotos enriquecidas via Wikipédia: ${wikiCount}`);

  // Estatísticas finais
  const finalWithPhoto = await prisma.candidate.count({
    where: { photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
  });
  const finalRjWithPhoto = await prisma.candidate.count({
    where: { state: 'RJ', photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
  });

  console.log(`\n🎉 Sincronização finalizada!`);
  console.log(`  Total Geral com Foto no DB: ${finalWithPhoto}`);
  console.log(`  Total RJ com Foto no DB: ${finalRjWithPhoto}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
