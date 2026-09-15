import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const CANDIDATE_PHOTOS = [
  // Presidenciáveis 2026
  {
    tseId: '280002542548',
    name: 'LUIZ INÁCIO LULA DA SILVA',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
  },
  {
    tseId: '280001600001',
    name: 'Luiz Inácio Lula da Silva',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
  },
  {
    tseId: '280002551975',
    name: 'EDMILSON SILVA COSTA',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Edmilson_Costa_-_PCB.jpg/500px-Edmilson_Costa_-_PCB.jpg',
  },
  {
    tseId: '280002541457',
    name: 'HERTZ DA CONCEICAO DIAS',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Hertz_Dias_PSTU.jpg/500px-Hertz_Dias_PSTU.jpg',
  },
  {
    tseId: '280002538811',
    name: 'SAMARA MARTINS DA SILVA FEITOSA',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Samara_Martins_UP.jpg',
  },
  {
    tseId: '280002552487',
    name: 'RUI COSTA PIMENTA',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Rui_Costa_Pimenta_Close.jpg/500px-Rui_Costa_Pimenta_Close.jpg',
  },

  // Governador RJ & Lideranças RJ
  {
    tseId: 'gov_rj_paes',
    name: 'Eduardo da Costa Paes',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
  },
  {
    tseId: '190002540001',
    name: 'Eduardo da Costa Paes',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg',
  },
  {
    tseId: '190002540198',
    name: 'CYRO GARCIA',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  },
  {
    tseId: 'gov_rj_cyro',
    name: 'Cyro Garcia',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg',
  },
  {
    tseId: 'gov_rj_juliete',
    name: 'Juliete Pantoja',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  },
  {
    tseId: '190002547272',
    name: 'JULIETE PANTOJA ALVES',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Juliete_Pantoja_%28foto_oficial_para_o_TSE%29_-_2022_-_FRJ190001609712_div.jpg',
  },
  {
    tseId: '190002548141',
    name: 'BENEDITA SOUZA DA SILVA SAMPAIO',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  },
  {
    tseId: 'sen_rj_benedita',
    name: 'Benedita da Silva',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/73701.jpg',
  },
  {
    tseId: 'sen_rj_lindbergh',
    name: 'Lindbergh Farias',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/74858.jpg',
  },
  {
    tseId: 'sen_rj_tarcisio',
    name: 'Tarcísio Motta',
    url: 'https://www.camara.leg.br/internet/deputado/bandep/220598.jpg',
  },
  {
    tseId: 'gov_rj_neves',
    name: 'Rodrigo Neves',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Rodrigo_Neves_em_2018.jpg/500px-Rodrigo_Neves_em_2018.jpg',
  },
];

function downloadBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        agent: httpsAgent,
        headers: {
          'User-Agent': 'EleicoesProgressistas/2.2.3 (https://eleicoes-progressistas.pages.dev; contato@eleicoesprogressistas.org)',
          Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

async function main() {
  console.log('🚀 Iniciando download e empacotamento das fotos oficiais dos candidatos...');

  const targetDirs = [
    path.resolve(process.cwd(), 'apps/mobile/public/candidates'),
    path.resolve(process.cwd(), 'apps/mobile/dist/candidates'),
    path.resolve(process.cwd(), 'apps/api/public/candidates'),
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  for (const cand of CANDIDATE_PHOTOS) {
    console.log(`📥 Baixando foto para ${cand.name} (${cand.tseId})...`);
    try {
      const buffer = await downloadBuffer(cand.url);
      if (buffer.length > 500) {
        // Salva nos diretórios de assets estáticos
        for (const dir of targetDirs) {
          const filePath = path.join(dir, `${cand.tseId}.jpg`);
          const tsePrefixed = path.join(dir, `tse_${cand.tseId}.jpg`);
          fs.writeFileSync(filePath, buffer);
          fs.writeFileSync(tsePrefixed, buffer);
        }

        // Atualiza banco de dados com a URL direta e fallback local
        await prisma.candidate.updateMany({
          where: {
            OR: [
              { tseId: cand.tseId },
              { name: { contains: cand.name, mode: 'insensitive' } },
            ],
          },
          data: {
            photoUrl: cand.url,
          },
        });

        console.log(`✅ Foto gravada com sucesso para ${cand.name} (${buffer.length} bytes)`);
      }
    } catch (err: any) {
      console.warn(`⚠️ Falha ao baixar ${cand.name} (${cand.url}): ${err.message}`);
    }
  }

  console.log('🎉 Todas as fotos foram baixadas, salvas estaticamente e sincronizadas no PostgreSQL!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
