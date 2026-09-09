const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

async function main() {
  const candidates = await prisma.candidate.findMany({
    where: {
      OR: [
        { name: { contains: 'Bandeira' } },
        { name: { contains: 'Alencar' } },
        { name: { contains: 'Aureo' } },
        { name: { contains: 'Benedita' } }
      ]
    },
    select: { id: true, tseId: true, name: true, party: true, state: true, cargo: true, photoUrl: true }
  });
  console.log(JSON.stringify(candidates, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
