import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const names = ['Cyro Garcia', 'Eduardo Serra', 'Mauro Luis Iasi', 'Mauro Iasi', 'Juliete Pantoja'];
  const cands = await prisma.candidate.findMany({
    where: { 
      OR: names.map(n => ({ name: { contains: n } }))
    },
    select: { name: true, tseId: true, photoUrl: true }
  });
  console.log(JSON.stringify(cands, null, 2));
}

check().finally(() => prisma.$disconnect());
