import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const cands = await prisma.candidate.findMany({
    where: { cargo: 'PRESIDENTE', name: { contains: 'Lula' } },
    select: { id: true, name: true, tseId: true, visible: true }
  });
  console.log(cands);
}

check().finally(() => prisma.$disconnect());
