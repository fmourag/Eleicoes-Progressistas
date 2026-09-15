import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const prisma = new PrismaClient();

const PARTIES_TO_REMOVE = [
  'UNIÃƒO',
  'UNIÃO',
  'UNIAO',
  'UNIÃO BRASIL',
  'UNIAO BRASIL',
  'UNIÃƒO BRASIL',
  'MISSÃƒO',
  'MISSÃO',
  'MISSAO',
  'DEMOCRATA',
  'DEMOCRATAS',
  'DEM',
  'DC',
  'DEMOCRACIA CRISTÃ',
  'DEMOCRACIA CRISTA',
  'PRTB',
];

async function main() {
  console.log('--- Iniciando limpeza de legendas conservadoras / indevidas ---');
  
  // Buscar candidatos afetados que não tenham apoio progressista explícito
  const candidatesToDelete = await prisma.candidate.findMany({
    where: {
      OR: [
        { party: { in: PARTIES_TO_REMOVE } },
        { party: { startsWith: 'UNI' } },
        { party: { startsWith: 'MISS' } },
        { party: { contains: 'DEMOCRATA' } },
        { party: { in: ['DC', 'PRTB'] } },
      ],
      isProgressiveSupported: false,
      supportedBy: null,
    },
    select: { id: true, name: true, party: true },
  });

  console.log('Total de candidatos identificados para exclusão: ' + candidatesToDelete.length);
  if (candidatesToDelete.length === 0) {
    console.log('Nenhum candidato a ser excluído.');
    return;
  }

  const ids = candidatesToDelete.map((c) => c.id);

  // Deletar possíveis relacionamentos primeiro para evitar violação de FK
  await prisma.matchResult.deleteMany({ where: { candidateId: { in: ids } } });
  await prisma.savedCandidate.deleteMany({ where: { candidateId: { in: ids } } });
  await prisma.proposal.deleteMany({ where: { candidateId: { in: ids } } });
  await prisma.integrityFlag.deleteMany({ where: { candidateId: { in: ids } } });
  await prisma.candidateVote.deleteMany({ where: { candidateId: { in: ids } } });
  await prisma.pledge.deleteMany({ where: { candidateId: { in: ids } } });

  // Deletar candidatos
  const deleteResult = await prisma.candidate.deleteMany({
    where: { id: { in: ids } },
  });

  console.log('Sucesso! Candidatos deletados: ' + deleteResult.count);

  // Estatísticas pós-limpeza
  const remaining = await prisma.candidate.count();
  console.log('Total restante de candidatos no banco: ' + remaining);

  const parties = await prisma.candidate.groupBy({
    by: ['party'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  console.log('--- Distribuição partidária atualizada ---');
  for (const p of parties) {
    console.log(p.party + ': ' + p._count.id);
  }
}

main()
  .catch((e) => {
    console.error('Erro ao executar limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
