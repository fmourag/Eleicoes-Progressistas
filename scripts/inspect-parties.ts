import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const prisma = new PrismaClient();

async function main() {
  const c = await prisma.candidate.findFirst({
    where: { name: { contains: 'CYRO' } },
    select: { id: true, name: true, tseId: true, photoUrl: true, cargo: true, state: true }
  });
  console.log('Cyro Garcia:', c);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
