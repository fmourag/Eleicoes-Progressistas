import { PrismaClient, Cargo, ElectionLevel } from '@prisma/client';
import pino from 'pino';
import { config, type TransformedCandidate } from './config.js';

const log = pino({ level: config.logLevel });

const prisma = new PrismaClient({ datasources: { db: { url: config.db } } });

// ─── Upsert single candidate (idempotent by tseId) ───
async function upsertCandidate(c: TransformedCandidate) {
  return prisma.candidate.upsert({
    where: { tseId_electionYear: { tseId: c.tseId, electionYear: config.year } },
    update: {
      electionYear: config.year,
      name: c.name,
      socialName: c.socialName,
      party: c.party,
      partyNumber: c.partyNumber,
      cargo: c.cargo as Cargo,
      level: c.level as ElectionLevel,
      candidaturaStatus: c.candidaturaStatus as any,
      dataRegistro: c.dataRegistro as any,
      municipality: c.municipality,
      state: c.state,
      cpfHash: c.cpfHash,
      fichaLimpa: c.fichaLimpa,
      photoUrl: c.photoUrl,
    } as any,
    create: {
      tseId: c.tseId,
      electionYear: config.year,
      name: c.name,
      socialName: c.socialName,
      party: c.party,
      partyNumber: c.partyNumber,
      cargo: c.cargo as Cargo,
      level: c.level as ElectionLevel,
      candidaturaStatus: c.candidaturaStatus as any,
      dataRegistro: c.dataRegistro as any,
      municipality: c.municipality,
      state: c.state,
      cpfHash: c.cpfHash,
      fichaLimpa: c.fichaLimpa,
      photoUrl: c.photoUrl,
    } as any,
  });
}

// ─── Batch upsert with error handling per record ─────
export async function loadCandidates(candidates: TransformedCandidate[]): Promise<{
  created: number;
  updated: number;
  errors: number;
}> {
  let created = 0;
  let updated = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < candidates.length; i += config.batchSize) {
    const batch = candidates.slice(i, i + config.batchSize);

    const results = await Promise.allSettled(
      batch.map((c) => upsertCandidate(c)),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        // Prisma upsert doesn't distinguish created/updated easily
        // We count all as processed
        created++;
      } else {
        log.error({ error: result.reason?.message }, 'upsert failed');
        errors++;
      }
    }

    log.info(
      { batch: Math.floor(i / config.batchSize) + 1, processed: Math.min(i + config.batchSize, candidates.length), errors },
      'batch loaded',
    );
  }

  return { created, updated, errors };
}

// ─── Load proposals as JSON on candidate ─────────────
export async function loadProposals(
  candidateTseId: string,
  proposals: { tituloPropaganda: string; textoPropaganda: string; tipoPropaganda: string }[],
): Promise<void> {
  if (!proposals.length) return;

  const formatted = proposals.map((p) => ({
    title: p.tituloPropaganda,
    text: p.textoPropaganda,
    type: p.tipoPropaganda,
  }));

  await prisma.candidate.updateMany({
    where: { tseId: candidateTseId },
    data: { proposals: formatted as any },
  });
}

// ─── Get stats ───────────────────────────────────────
export async function getStats() {
  const total = await prisma.candidate.count();
  const byState = await prisma.candidate.groupBy({
    by: ['state'],
    _count: true,
    orderBy: { _count: { state: 'desc' } },
  });
  const byCargo = await prisma.candidate.groupBy({
    by: ['cargo'],
    _count: true,
  });

  return { total, byState, byCargo };
}

export async function disconnect() {
  await prisma.$disconnect();
}
