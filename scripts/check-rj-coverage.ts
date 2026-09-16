import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allRj = await prisma.candidate.findMany({
    where: { state: 'RJ' },
    select: { id: true, tseId: true, name: true, cargo: true, party: true, numeroUrna: true, photoUrl: true },
  });

  console.log(`Total RJ candidates: ${allRj.length}`);
  const withPhoto = allRj.filter((c) => c.photoUrl && c.photoUrl.startsWith('http'));
  console.log(`With valid HTTP photo: ${withPhoto.length}`);
  console.log(`Without HTTP photo: ${allRj.length - withPhoto.length}`);

  const byCargo: Record<string, { total: number; withPhoto: number }> = {};
  for (const c of allRj) {
    if (!byCargo[c.cargo]) byCargo[c.cargo] = { total: 0, withPhoto: 0 };
    byCargo[c.cargo].total++;
    if (c.photoUrl && c.photoUrl.startsWith('http')) byCargo[c.cargo].withPhoto++;
  }

  console.log('Breakdown by cargo in RJ:', JSON.stringify(byCargo, null, 2));
}

main().finally(() => prisma.$disconnect());
