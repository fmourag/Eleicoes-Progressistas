import { PrismaClient } from '@prisma/client';

const directDbUrl = 'postgresql://postgres.zsrjpitpyhsmsxerzxzc:BZZe3q0EcrXXAwuB@54.94.90.106:6543/postgres?pgbouncer=true&connection_limit=1';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directDbUrl,
    },
  },
});

async function main() {
  const total = await prisma.candidate.count();
  console.log('Total candidates in DB:', total);

  const byState = await prisma.candidate.groupBy({
    by: ['state'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  console.log('Candidates by state:', byState);

  // Check photos status by state
  for (const item of byState) {
    const withPhoto = await prisma.candidate.count({
      where: {
        state: item.state,
        photoUrl: { not: null },
        AND: { photoUrl: { not: '' } },
      },
    });
    console.log(`State ${item.state || 'NULL'}: ${withPhoto}/${item._count.id} with photoUrl`);
  }

  // Check if any candidates outside RJ have duplicate or suspicious photoUrls
  const nonRjCandidates = await prisma.candidate.findMany({
    where: { state: { not: 'RJ' } },
    select: { id: true, name: true, state: true, cargo: true, party: true, photoUrl: true, tseId: true },
    take: 30,
  });
  console.log('\nNon-RJ Sample (up to 30):', nonRjCandidates);

  // Check photoUrl distribution
  const allWithPhotos = await prisma.candidate.findMany({
    where: { photoUrl: { not: null }, AND: { photoUrl: { not: '' } } },
    select: { photoUrl: true },
  });
  const photoCounts: Record<string, number> = {};
  for (const c of allWithPhotos) {
    if (c.photoUrl) {
      photoCounts[c.photoUrl] = (photoCounts[c.photoUrl] || 0) + 1;
    }
  }
  const duplicates = Object.entries(photoCounts).filter(([url, count]) => count > 1 && !url.includes('placeholder'));
  console.log(`\nDuplicate photoUrls across entire DB:`, duplicates);
}

main().catch(console.error).finally(() => prisma.$disconnect());
