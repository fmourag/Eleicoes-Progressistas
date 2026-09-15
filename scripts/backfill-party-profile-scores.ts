import { PrismaClient } from '@prisma/client';
import { isNeutralMatchingProfile } from '../packages/shared/src/index';

const prisma = new PrismaClient();

function getPartyScores(party: string): Record<string, number> | null {
  const p = (party || '').toUpperCase().trim();
  if (['PSOL', 'UP', 'PCB', 'PSTU', 'PCO'].includes(p)) {
    return { p1: 0.96, p2: 0.98, p3: 0.92, p4: 0.94, p5: 0.93, p6: 0.98, p7: 0.99, p8: 0.90, p9: 0.98, p10: 0.95, p11: 0.98, p12: 0.99, p13: 0.88 };
  }
  if (['PT', 'PCDOB'].includes(p)) {
    return { p1: 0.94, p2: 0.95, p3: 0.90, p4: 0.92, p5: 0.91, p6: 0.95, p7: 0.96, p8: 0.88, p9: 0.95, p10: 0.88, p11: 0.96, p12: 0.97, p13: 0.92 };
  }
  if (['PSB', 'PDT'].includes(p)) {
    return { p1: 0.95, p2: 0.88, p3: 0.88, p4: 0.90, p5: 0.90, p6: 0.88, p7: 0.90, p8: 0.86, p9: 0.92, p10: 0.86, p11: 0.94, p12: 0.93, p13: 0.90 };
  }
  if (['REDE', 'PV'].includes(p)) {
    return { p1: 0.90, p2: 0.86, p3: 0.99, p4: 0.88, p5: 0.86, p6: 0.84, p7: 0.90, p8: 0.86, p9: 0.90, p10: 0.85, p11: 0.92, p12: 0.88, p13: 0.89 };
  }
  if (['AGIR', 'SOLIDARIEDADE', 'MOBILIZA'].includes(p)) {
    return { p1: 0.86, p2: 0.82, p3: 0.80, p4: 0.84, p5: 0.84, p6: 0.84, p7: 0.88, p8: 0.82, p9: 0.88, p10: 0.82, p11: 0.86, p12: 0.82, p13: 0.86 };
  }
  if (['PSD', 'CIDADANIA', 'PMB', 'MDB', 'PSDB'].includes(p)) {
    return { p1: 0.85, p2: 0.80, p3: 0.82, p4: 0.85, p5: 0.85, p6: 0.78, p7: 0.80, p8: 0.82, p9: 0.85, p10: 0.85, p11: 0.85, p12: 0.80, p13: 0.88 };
  }
  return null;
}

async function main() {
  console.log('🔄 Buscando candidatos com profileScores neutros (0.5)...');
  const candidates = await prisma.candidate.findMany({
    select: { id: true, name: true, party: true, profileScores: true },
  });

  let updated = 0;
  for (const c of candidates) {
    if (isNeutralMatchingProfile(c.profileScores as Record<string, number>)) {
      const partyScores = getPartyScores(c.party);
      if (partyScores) {
        await prisma.candidate.update({
          where: { id: c.id },
          data: { profileScores: partyScores },
        });
        updated++;
      }
    }
  }

  console.log(`✅ Atualizados ${updated} candidatos com scores programáticos partidários!`);
  await prisma.$disconnect();
}

main().catch(console.error);