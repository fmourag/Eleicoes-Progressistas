import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const prisma = new PrismaClient();

async function main() {
  const parties = await prisma.candidate.groupBy({
    by: ['party'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  console.log('=== PARTIDOS NO BANCO ===');
  for (const p of parties) {
    console.log(p.party + ': ' + p._count.id);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
