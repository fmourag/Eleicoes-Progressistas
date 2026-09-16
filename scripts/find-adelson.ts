import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cands = await prisma.candidate.findMany({
    where: {
      OR: [
        { name: { contains: 'Adelson', mode: 'insensitive' } },
        { name: { contains: 'Ademir', mode: 'insensitive' } },
        { name: { contains: 'Guedes', mode: 'insensitive' } },
      ],
    },
    select: { id: true, tseId: true, name: true, party: true, cargo: true, state: true, photoUrl: true, numeroUrna: true },
  });
  console.log('Found candidates:', cands);
}

main().finally(() => prisma.$disconnect());
