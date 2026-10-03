import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const wikiRes = await prisma.candidate.updateMany({
    where: { photoUrl: { contains: 'wikipedia.org' } },
    data: { photoUrl: null }
  });
  console.log('Fixed wiki', wikiRes.count, 'candidates');

  const camaraRes = await prisma.candidate.updateMany({
    where: { photoUrl: { contains: 'camara.leg.br' } },
    data: { photoUrl: null }
  });
  console.log('Fixed camara', camaraRes.count, 'candidates');
}

fix().finally(() => prisma.$disconnect());
