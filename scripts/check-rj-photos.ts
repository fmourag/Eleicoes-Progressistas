import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rjCands = await prisma.candidate.findMany({
    where: { state: 'RJ', cargo: { in: ['GOVERNADOR', 'SENADOR'] } },
    select: { name: true, cargo: true, party: true, numeroUrna: true, tseId: true, photoUrl: true },
  });

  console.log('=== CANDIDATOS RJ (GOVERNADOR & SENADOR) NO POSTGRESQL ===');
  for (const c of rjCands) {
    console.log(`[${c.cargo}] ${c.name} (${c.party}, Urna: ${c.numeroUrna}, TSE: ${c.tseId})`);
    console.log(`  -> Photo URL: ${c.photoUrl}`);
  }
}

main().finally(() => prisma.$disconnect());
