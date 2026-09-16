import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cands = await prisma.candidate.findMany({
    where: {
      OR: [
        { name: { contains: 'SUZANO', mode: 'insensitive' } },
        { name: { contains: 'BARROS', mode: 'insensitive' } },
        { name: { contains: 'ANIELLE', mode: 'insensitive' } },
      ],
      state: 'RJ',
    },
    select: { id: true, tseId: true, name: true, party: true, cargo: true, state: true, numeroUrna: true, photoUrl: true },
  });
  console.log('Found RJ candidates:', cands);
}

main().finally(() => prisma.$disconnect());
