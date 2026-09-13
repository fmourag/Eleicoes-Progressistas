import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating candidate photos in database...');

  // 1. Lula
  await prisma.candidate.updateMany({
    where: { cargo: 'PRESIDENTE', tseId: '280001600001' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/500px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg' }
  });

  // 2. Cyro Garcia
  await prisma.candidate.updateMany({
    where: { tseId: 'gov_rj_cyro' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/2020_CYRO_GARCIA_CANDIDATO_PREFEITO_RJ_RIO_DE_JANEIRO_TSE_%28190000858699%29.jpg' }
  });

  // 3. Eduardo Paes
  await prisma.candidate.updateMany({
    where: { tseId: 'gov_rj_paes' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eduardo_Paes%2C_October_2024.jpg/500px-Eduardo_Paes%2C_October_2024.jpg' }
  });

  // 4. Fernando Haddad
  await prisma.candidate.updateMany({
    where: { tseId: 'gov_sp_haddad' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Fernando_Haddad_posse_min._da_Fazenda.jpg/500px-Fernando_Haddad_posse_min._da_Fazenda.jpg' }
  });

  // 5. Carlos Minc
  await prisma.candidate.updateMany({
    where: { tseId: 'ale_rj_carlosminc' },
    data: { photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Carlos_Minc_2022.jpg/500px-Carlos_Minc_2022.jpg' }
  });

  console.log('Database photos updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
