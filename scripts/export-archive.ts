import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const dbPath = path.resolve(process.cwd(), 'apps/api/dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

const PILLARS = [
  'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7',
  'p8', 'p9', 'p10', 'p11', 'p12', 'p13',
];

async function main() {
  const outputDir = path.resolve(process.cwd(), 'dist-archive');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Fetching candidates from database at', dbPath);
  let candidates: any[] = [];
  try {
    candidates = await prisma.candidate.findMany({
      where: {
        electionYear: 2026,
      },
      select: {
        id: true,
        tseId: true,
        name: true,
        socialName: true,
        viceName: true,
        party: true,
        partyNumber: true,
        numeroUrna: true,
        cargo: true,
        level: true,
        candidaturaStatus: true,
        municipality: true,
        state: true,
        photoUrl: true,
        fichaLimpa: true,
        profileScores: true,
      },
    });
  } catch (err) {
    console.warn('Could not query database directly, fallback to empty array or check error:', err);
  }

  console.log(`Exporting ${candidates.length} candidates to candidates-2026.json...`);
  const candidatesFilePath = path.join(outputDir, 'candidates-2026.json');
  fs.writeFileSync(candidatesFilePath, JSON.stringify(candidates, null, 2), 'utf-8');

  // 2. scores-summary.json (médias por partido e por cargo)
  console.log('Computing scores-summary.json...');
  const byParty: Record<string, { count: number; sums: Record<string, number> }> = {};
  const byCargo: Record<string, { count: number; sums: Record<string, number> }> = {};

  for (const c of candidates) {
    const scores = (c.profileScores as Record<string, number>) || {};
    // by party
    if (!byParty[c.party]) {
      byParty[c.party] = { count: 0, sums: {} };
      PILLARS.forEach((p) => (byParty[c.party].sums[p] = 0));
    }
    byParty[c.party].count++;
    PILLARS.forEach((p) => {
      byParty[c.party].sums[p] += Number(scores[p] || 0);
    });

    // by cargo
    if (!byCargo[c.cargo]) {
      byCargo[c.cargo] = { count: 0, sums: {} };
      PILLARS.forEach((p) => (byCargo[c.cargo].sums[p] = 0));
    }
    byCargo[c.cargo].count++;
    PILLARS.forEach((p) => {
      byCargo[c.cargo].sums[p] += Number(scores[p] || 0);
    });
  }

  const scoresSummary = {
    byParty: Object.entries(byParty).reduce((acc, [party, data]) => {
      acc[party] = {
        totalCandidates: data.count,
        averages: PILLARS.reduce((pAcc, p) => {
          pAcc[p] = data.count > 0 ? Number((data.sums[p] / data.count).toFixed(2)) : 0;
          return pAcc;
        }, {} as Record<string, number>),
      };
      return acc;
    }, {} as Record<string, any>),
    byCargo: Object.entries(byCargo).reduce((acc, [cargo, data]) => {
      acc[cargo] = {
        totalCandidates: data.count,
        averages: PILLARS.reduce((pAcc, p) => {
          pAcc[p] = data.count > 0 ? Number((data.sums[p] / data.count).toFixed(2)) : 0;
          return pAcc;
        }, {} as Record<string, number>),
      };
      return acc;
    }, {} as Record<string, any>),
  };

  const scoresSummaryFilePath = path.join(outputDir, 'scores-summary.json');
  fs.writeFileSync(scoresSummaryFilePath, JSON.stringify(scoresSummary, null, 2), 'utf-8');

  // 3. cola-template.json (layout em branco para preenchimento offline)
  console.log('Generating cola-template.json...');
  const colaTemplate = {
    title: 'Cola Eleitoral - Eleições Gerais 2026',
    instruction: 'Preencha os números dos seus candidatos para levar no dia da votação.',
    fields: [
      {
        order: 1,
        cargo: 'DEPUTADO_FEDERAL',
        label: 'Deputado(a) Federal',
        digits: 4,
        candidateName: '',
        party: '',
        number: '',
      },
      {
        order: 2,
        cargo: 'DEPUTADO_ESTADUAL',
        label: 'Deputado(a) Estadual / Distrital',
        digits: 5,
        candidateName: '',
        party: '',
        number: '',
      },
      {
        order: 3,
        cargo: 'SENADOR_1',
        label: 'Primeiro(a) Senador(a)',
        digits: 3,
        candidateName: '',
        party: '',
        number: '',
      },
      {
        order: 4,
        cargo: 'SENADOR_2',
        label: 'Segundo(a) Senador(a)',
        digits: 3,
        candidateName: '',
        party: '',
        number: '',
      },
      {
        order: 5,
        cargo: 'GOVERNADOR',
        label: 'Governador(a)',
        digits: 2,
        candidateName: '',
        party: '',
        number: '',
      },
      {
        order: 6,
        cargo: 'PRESIDENTE',
        label: 'Presidente(a) da República',
        digits: 2,
        candidateName: '',
        party: '',
        number: '',
      },
    ],
    metadata: {
      year: 2026,
      app: 'Eleições Progressistas',
      version: '2.2.0',
    },
  };

  const colaTemplateFilePath = path.join(outputDir, 'cola-template.json');
  fs.writeFileSync(colaTemplateFilePath, JSON.stringify(colaTemplate, null, 2), 'utf-8');

  // 4. manifest.json (hash SHA-256 de cada arquivo, data de corte, versão 2.2.0)
  console.log('Generating manifest.json...');
  const filesToHash = [
    'candidates-2026.json',
    'scores-summary.json',
    'cola-template.json',
  ];

  const fileManifests: Record<string, { sizeBytes: number; sha256: string }> = {};

  for (const fileName of filesToHash) {
    const fPath = path.join(outputDir, fileName);
    const content = fs.readFileSync(fPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    fileManifests[fileName] = {
      sizeBytes: content.length,
      sha256: hash,
    };
  }

  const manifest = {
    version: '2.2.0',
    cutoffDate: new Date().toISOString(),
    files: fileManifests,
  };

  const manifestFilePath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('Archive bundle successfully generated in dist-archive/:');
  console.log(JSON.stringify(manifest, null, 2));
}

main()
  .catch((e) => {
    console.error('Error generating archive bundle:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
