import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating candidate IDs to fix wrong photos...');
  
  await prisma.candidate.updateMany({
    where: { numeroUrna: '1333', state: 'RJ', cargo: 'DEPUTADO_FEDERAL' },
    data: { tseId: 'dep_220606', photoUrl: '/candidates/dep_220606.jpg' }
  });
  console.log('Fixed Reimont');

  await prisma.candidate.updateMany({
    where: { numeroUrna: '5050', state: 'RJ', cargo: 'DEPUTADO_FEDERAL' },
    data: { tseId: 'dep_152605', photoUrl: '/candidates/dep_152605.jpg' }
  });
  console.log('Fixed Glauber Braga');

  await prisma.candidate.updateMany({
    where: { numeroUrna: '5015', state: 'RJ', cargo: 'DEPUTADO_FEDERAL' },
    data: { tseId: 'dep_74171', photoUrl: '/candidates/dep_74171.jpg', name: 'Francisco Rodrigues de Alencar Filho' }
  });
  console.log('Fixed Chico Alencar');

  await prisma.candidate.updateMany({
    where: { numeroUrna: '40163', state: 'RJ', cargo: 'DEPUTADO_ESTADUAL' },
    data: { tseId: 'ale_rj_carlosminc' }
  });
  console.log('Fixed Carlos Minc');

  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
