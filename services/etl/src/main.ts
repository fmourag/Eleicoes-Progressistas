import pino from 'pino';
import { config } from './config.js';
import { extractAllCandidates, fetchProposals } from './extractors.js';
import { transformAll } from './transformers.js';
import { loadCandidates, loadProposals, getStats, disconnect } from './loaders.js';

const log = pino({ level: config.logLevel });

async function main() {
  const startTime = Date.now();
  log.info({ year: config.year, ufs: config.ufs }, 'ETL pipeline started');

  // ─── Extract ───────────────────────────────────────
  log.info('Phase 1: Extract');
  const rawCandidates = await extractAllCandidates();
  log.info({ rawCount: rawCandidates.length }, 'extraction complete');

  if (rawCandidates.length === 0) {
    log.warn('No candidates extracted. Check TSE API availability.');
    await disconnect();
    return;
  }

  // ─── Transform ─────────────────────────────────────
  log.info('Phase 2: Transform');
  const { candidates, skipped, errors: transformErrors } = transformAll(rawCandidates);
  log.info({ valid: candidates.length, skipped, errors: transformErrors }, 'transform complete');

  // ─── Load ──────────────────────────────────────────
  log.info('Phase 3: Load');
  const { created, errors: loadErrors } = await loadCandidates(candidates);
  log.info({ created, errors: loadErrors }, 'load complete');

  // ─── Load Proposals (top 200 candidates) ───────────
  log.info('Phase 4: Load Proposals');
  const topCandidates = candidates.slice(0, 200);
  let proposalsLoaded = 0;
  for (const c of topCandidates) {
    try {
      const proposals = await fetchProposals(config.year, c.tseId);
      if (proposals.length > 0) {
        await loadProposals(c.tseId, proposals);
        proposalsLoaded++;
      }
    } catch (err) {
      log.debug({ tseId: c.tseId }, 'failed to load proposals');
    }
  }
  log.info({ proposalsLoaded }, 'proposals loaded');

  // ─── Stats ─────────────────────────────────────────
  const stats = await getStats();
  log.info({ total: stats.total, byState: stats.byState, byCargo: stats.byCargo }, 'database stats');

  // ─── Summary ───────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log.info(
    {
      elapsed: `${elapsed}s`,
      extracted: rawCandidates.length,
      transformed: candidates.length,
      loaded: created,
      proposalsLoaded,
    },
    'ETL pipeline finished',
  );

  await disconnect();
}

main().catch((err) => {
  log.fatal({ error: err.message }, 'ETL pipeline failed');
  process.exit(1);
});
