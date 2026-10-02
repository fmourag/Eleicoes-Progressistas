/**
 * fix-wrong-photos.ts — Limpeza de fotos incorretas persistidas no banco.
 *
 * Contexto: registros do seed (official-candidates.data.ts) nasceram com a
 * photoUrl de outra pessoa (copy-paste). Como a API serve a URL gravada no
 * banco antes de tentar o TSE, corrigir só o código/seed não basta.
 *
 * Uso:
 *   Dry-run (só lista):  npx tsx scripts/fix-wrong-photos.ts [--dry-run]
 *   Produção (Supabase): DATABASE_URL=postgresql://... npx tsx scripts/fix-wrong-photos.ts --apply
 *   Por padrão usa process.env.DATABASE_URL (raiz .env = Supabase prod).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// tseId -> foto que NÃO pertence a ele (qualquer uma dessas = limpar para '')
const WRONG_PHOTOS = new Map<string, string[]>([
  ['dep_rj_rejane', ['/candidates/dep_74848.jpg']],
  ['ale_rj_marinadomst', ['/candidates/ale_pe_rosaamorim.jpg']],
  ['ale_rj_yurimoura', ['/candidates/ale_rj_danimonteiro.jpg']],
  ['ale_rj_veronicacoutinho', ['/candidates/ale_rj_danimonteiro.jpg']],
  ['ale_rj_josemar', ['/candidates/ale_rj_danimonteiro.jpg']],
  ['dep_sp_raul', ['/candidates/pcb_gabrielcolombo.jpg']],
  ['dep_rj_heitor', ['/candidates/pcb_ivanpinheiro.jpg']],
  ['ale_sp_leci', ['/candidates/280001600026.jpg']],
  ['ale_rj_elikatakimoto', ['/candidates/280001600026.jpg']],
  ['sen_rj_ivan', ['/candidates/pcb_ivanpinheiro.jpg']],
  ['dep_rj_ivan', ['/candidates/pcb_ivanpinheiro.jpg']],
  ['ale_rj_ivan', ['/candidates/pcb_ivanpinheiro.jpg']],
  ['sen_sp_colombo', ['/candidates/pcb_gabrielcolombo.jpg']],
  ['dep_sp_colombo', ['/candidates/pcb_gabrielcolombo.jpg']],
  ['sen_pr_carol', ['/candidates/dep_220542.jpg', '/candidates/ale_pr_anajulia.jpg']],
]);

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`[fix-wrong-photos] modo: ${apply ? 'APPLY' : 'DRY-RUN (use --apply para gravar)'}`);
  let fixed = 0;
  let deleted = 0;

  // Fase 1: limpa photoUrl comprovadamente trocada (mantém o registro)
  for (const [tseId, badUrls] of WRONG_PHOTOS) {
    const rows = await prisma.candidate.findMany({
      where: { tseId },
      select: { id: true, name: true, tseId: true, photoUrl: true },
    });
    for (const r of rows) {
      const isWrong = !r.photoUrl || badUrls.some((b) => (r.photoUrl || '').includes(b));
      console.log(`- ${r.tseId} | ${r.name} | atual=${r.photoUrl} | errada=${isWrong}`);
      if (isWrong && apply && r.photoUrl) {
        await prisma.candidate.update({ where: { id: r.id }, data: { photoUrl: '' } });
        fixed++;
      }
    }
  }
  console.log(`[fix-wrong-photos] registros limpos: ${fixed}`);

  // Fase 2: remove registros duplicados (mesma pessoa, outro tseId já cobre).
  // Relações (cola, votos, etc.) têm onDelete Cascade — exclusão segura.
  // Mantidos: dep_74848 (Jandira, foto 61KB ok), dep_74057 (Alice, foto 49KB ok),
  //   dep_fed_orlando_silva (nome correto "Júnior"; foto quebrada -> limpa),
  //   sen_pr_carol (Dartora, sem foto honesta).
  // Removidos: dep_fed_jandira_feghali, dep_fed_alice_portugal (fotos placeholder 126B),
  //   dep_141533 (nome "Santos" errado + foto de outro homem),
  //   dep_220542 (foto de um homem; titular é mulher).
  const DELETE_DUPLICATES = [
    'dep_fed_jandira_feghali',
    'dep_fed_alice_portugal',
    'dep_141533',
    'dep_220542',
  ];
  for (const tseId of DELETE_DUPLICATES) {
    const rows = await prisma.candidate.findMany({
      where: { tseId },
      select: { id: true, name: true, tseId: true, photoUrl: true },
    });
    for (const r of rows) {
      console.log(`x DUPLICADO ${r.tseId} | ${r.name} | foto=${r.photoUrl}`);
      if (apply) {
        await prisma.candidate.delete({ where: { id: r.id } });
        deleted++;
      }
    }
  }
  // Orlando: nome correto, mas foto é placeholder quebrado -> honesto ''
  const orlando = await prisma.candidate.findMany({
    where: { tseId: 'dep_fed_orlando_silva' },
    select: { id: true, photoUrl: true },
  });
  for (const r of orlando) {
    if (r.photoUrl && apply) {
      await prisma.candidate.update({ where: { id: r.id }, data: { photoUrl: '' } });
      fixed++;
      console.log(`- dep_fed_orlando_silva foto quebrada limpa`);
    }
  }
  console.log(`[fix-wrong-photos] duplicados removidos: ${deleted} | total limpos: ${fixed}`);
}

main()
  .catch((e) => { console.error('[fix-wrong-photos] ERRO:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
