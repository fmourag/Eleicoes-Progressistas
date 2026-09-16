import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.candidate.count();
  const withPhoto = await prisma.candidate.count({
    where: {
      photoUrl: {
        not: null,
      },
      AND: {
        photoUrl: {
          not: '',
        },
      },
    },
  });
  console.log(`Total candidates: ${total}`);
  console.log(`With photoUrl in DB: ${withPhoto} (${((withPhoto / total) * 100).toFixed(1)}%)`);

  const rjTotal = await prisma.candidate.count({ where: { state: 'RJ' } });
  const rjWithPhoto = await prisma.candidate.count({
    where: {
      state: 'RJ',
      photoUrl: { not: null },
      AND: { photoUrl: { not: '' } },
    },
  });
  console.log(`RJ candidates: ${rjTotal}`);
  console.log(`RJ with photoUrl: ${rjWithPhoto} (${((rjWithPhoto / rjTotal) * 100).toFixed(1)}%)`);

  const byCargo = await prisma.candidate.groupBy({
    by: ['cargo'],
    _count: { id: true },
  });
  console.log('By Cargo:', byCargo);

  const rjByCargo = await prisma.candidate.groupBy({
    by: ['cargo'],
    where: { state: 'RJ' },
    _count: { id: true },
  });
  console.log('RJ By Cargo:', rjByCargo);

  // Let's check some RJ deputados
  const rjDepFed = await prisma.candidate.findMany({
    where: { state: 'RJ', cargo: 'DEPUTADO_FEDERAL' },
    take: 10,
    select: { id: true, tseId: true, name: true, party: true, photoUrl: true, numeroUrna: true },
  });
  console.log('RJ Deputados Federais sample:', rjDepFed);
}

main().finally(() => prisma.$disconnect());
