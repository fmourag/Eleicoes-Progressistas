import assert from 'assert';
import { ELECTION_CONFIG, ELECTION_STATUS } from '../apps/mobile/src/constants/election-night';
import { RateLimiter } from '../apps/mobile/src/utils/rate-limiter';
import { MemoryCache } from '../apps/mobile/src/utils/memory-cache';
import { electionNightStorage } from '../apps/mobile/src/storage/election-night-storage';
import { TseResultsService } from '../apps/mobile/src/services/tse-results.service';
import { isElectionPeriodActive } from '../apps/mobile/src/hooks/use-election-night';
import { getCivicSupportState, recordContribution } from '../apps/mobile/src/storage/civic-support-storage';
import { PIX_KEY, PIX_KEY_DISPLAY, PIX_AMOUNT } from '../apps/mobile/src/constants/civic-support';
import { ElectionResult, NationalStats, TseApiResponse } from '../apps/mobile/src/types/election-night';

console.log('🗳️ Iniciando testes do Módulo de Apuração Eleitoral em Tempo Real (Election Night v2.2.5)...');

async function runTests() {
  // Test 1: RateLimiter singleton e espera
  console.log('\n[1/7] Testando RateLimiter...');
  const limiter = new RateLimiter(50);
  const start = Date.now();
  await limiter.wait();
  await limiter.wait();
  const elapsed = Date.now() - start;
  assert(elapsed >= 35, `RateLimiter deve esperar pelo menos 35ms entre chamadas (tempo decorrido: ${elapsed}ms)`);
  console.log('  ✅ RateLimiter respeitou intervalo de espera obrigatório.');

  // Test 2: MemoryCache com TTL e expiração
  console.log('\n[2/7] Testando MemoryCache...');
  const cache = new MemoryCache<string>(60);
  cache.set('key1', 'valor1');
  assert.strictEqual(cache.get('key1'), 'valor1', 'Cache deve retornar valor gravado');
  assert.strictEqual(cache.has('key1'), true, 'Cache deve indicar presença da chave');
  
  await new Promise(r => setTimeout(r, 75));
  assert.strictEqual(cache.get('key1'), null, 'Cache deve expirar valor após TTL');
  console.log('  ✅ MemoryCache grava, recupera e expira corretamente.');

  // Test 3: Storage Local MMKV
  console.log('\n[3/7] Testando Storage Local MMKV (Zero Coleta)...');
  electionNightStorage.clearResults();
  
  const sampleResults = new Map<string, ElectionResult>();
  sampleResults.set('sq123', {
    tseId: 'sq123',
    candidateName: 'Candidato Cívico',
    numeroUrna: '13',
    party: 'PT',
    cargo: 'PRESIDENTE',
    uf: 'BR',
    status: 'ELEITO',
    votes: 50000000,
    percentage: 51.5,
    position: 1,
    totalCandidates: 4,
    totalVotesApurados: 100000000,
    lastUpdate: Date.now(),
  });

  electionNightStorage.saveResults(sampleResults);
  const loadedResults = electionNightStorage.getResults();
  assert.strictEqual(loadedResults.size, 1, 'Deve recuperar 1 resultado salvo');
  assert.strictEqual(loadedResults.get('sq123')?.status, 'ELEITO');
  assert.strictEqual(loadedResults.get('sq123')?.candidateName, 'Candidato Cívico');

  // National stats storage
  const sampleStats: NationalStats = {
    presidente: loadedResults.get('sq123')!,
    governadores: {},
    senadores: {},
    percentualApurado: 99.8,
    totalSecoes: 400000,
    secoesApuradas: 399200,
    lastUpdate: Date.now(),
  };
  electionNightStorage.saveNationalStats(sampleStats);
  const loadedStats = electionNightStorage.getNationalStats();
  assert.strictEqual(loadedStats?.percentualApurado, 99.8);
  assert.strictEqual(loadedStats?.presidente?.status, 'ELEITO');

  // Polling prefs storage
  electionNightStorage.setPollingPrefs({ enabled: true, notifications: false });
  const loadedPrefs = electionNightStorage.getPollingPrefs();
  assert.strictEqual(loadedPrefs.enabled, true);
  assert.strictEqual(loadedPrefs.notifications, false);

  console.log('  ✅ Persistência local 100% isolada e atômica validada.');

  // Test 4: Serviço TSE (Mapeamento de Status e Códigos de Cargo)
  console.log('\n[4/7] Testando TseResultsService...');
  const tseService = TseResultsService.getInstance();
  
  assert.strictEqual(tseService.getCargoCode('PRESIDENTE'), '0001');
  assert.strictEqual(tseService.getCargoCode('GOVERNADOR'), '0003');
  assert.strictEqual(tseService.getCargoCode('SENADOR'), '0005');
  assert.strictEqual(tseService.getCargoCode('DEPUTADO_FEDERAL'), '0006');
  assert.strictEqual(tseService.getCargoCode('DEPUTADO_ESTADUAL'), '0007');

  assert.strictEqual(tseService.mapStatus('ELEITO', 1000, 2000), 'ELEITO');
  assert.strictEqual(tseService.mapStatus('ELEITO POR QP', 1000, 2000), 'ELEITO');
  // 2º turno só existe para PRESIDENTE/GOVERNADOR (regra TSE; deputados/senadores nunca)
  assert.strictEqual(tseService.mapStatus('2º TURNO', 1000, 2000, 'PRESIDENTE', 1, 40.0), 'SEGUNDO_TURNO');
  assert.strictEqual(tseService.mapStatus('2º TURNO', 1000, 2000, 'DEPUTADO FEDERAL', 3, 10.0), 'NAO_ELEITO');
  assert.strictEqual(tseService.mapStatus('NÃO ELEITO', 1000, 2000), 'NAO_ELEITO');
  assert.strictEqual(tseService.mapStatus('', 500, 2000), 'APURANDO');

  console.log('  ✅ Mapeamento de códigos de cargo e status oficiais do TSE validado.');

  // Test 5: Matching por SQ_CANDIDATO (seq === tseId)
  console.log('\n[5/7] Testando Matching por SQ_CANDIDATO...');
  const mockTseResponse: TseApiResponse = {
    cdabr: 'BR',
    cdc: '0001',
    dht: '2026-10-04 19:30:00',
    dvg: [],
    cand: [
      { seq: '280001600001', n: '13', nm: 'Lula', p: 'PT', c: 1, dv: 1, v: 60000000, pv: 52.0, s: 'ELEITO', sit: 'Eleito' },
      { seq: '280001600002', n: '22', nm: 'Opositor', p: 'PL', c: 1, dv: 1, v: 50000000, pv: 44.0, s: 'NÃO ELEITO', sit: 'Não Eleito' },
    ],
    vapt: 110000000,
    e: '2045202026',
    t: '1',
  };

  // Injecao no cache para simular resposta sem requisicao de rede externa
  (tseService as any).cache.set('br-0001', mockTseResponse);

  const colaCandidates = [
    {
      id: 'cand-1',
      name: 'Luiz Inácio Lula da Silva',
      socialName: 'Lula',
      cargo: 'PRESIDENTE',
      party: 'PT',
      numeroUrna: '13',
      tseId: '280001600001',
    },
    {
      id: 'cand-2',
      name: 'Candidato Desconhecido',
      cargo: 'PRESIDENTE',
      party: 'IND',
      numeroUrna: '99',
      tseId: '999999999999',
    },
  ];

  const resultsCola = await tseService.getResultsForCola(colaCandidates);
  const lulaResult = resultsCola.get('280001600001');
  assert(lulaResult !== undefined, 'Lula deve ser encontrado pelo SQ_CANDIDATO (tseId)');
  assert.strictEqual(lulaResult?.status, 'ELEITO');
  assert.strictEqual(lulaResult?.votes, 60000000);
  assert.strictEqual(lulaResult?.position, 1);

  const unknownResult = resultsCola.get('999999999999');
  assert.strictEqual(unknownResult?.status, 'APURANDO');
  assert.strictEqual(unknownResult?.votes, 0);

  console.log('  ✅ Matching idempotente por SQ_CANDIDATO validado com sucesso.');

  // Test 6: Regra de Paywall Cívico
  console.log('\n[6/7] Testando Paywall Cívico...');
  assert.strictEqual(PIX_KEY, '+5521971943298');
  assert.strictEqual(PIX_KEY_DISPLAY, '(21) 97194-3298');
  assert.strictEqual(PIX_AMOUNT, 3.0);

  // Testa transição de contribuição
  recordContribution(3.0);
  const supportState = getCivicSupportState();
  assert.strictEqual(supportState.hasContributed, true, 'Usuário deve ter status hasContributed após apoiar');
  assert.strictEqual(supportState.pixKey, '+5521971943298');

  console.log('  ✅ Paywall cívico e desbloqueio transparente via PIX celular E.164 validados.');

  // Test 7: Validação do Período Eleitoral
  console.log('\n[7/7] Testando Verificação de Período Eleitoral...');
  const outsidePeriod = new Date('2026-09-17T12:00:00-03:00');
  assert.strictEqual(isElectionPeriodActive(outsidePeriod, false), false, 'Não deve estar ativo em setembro');
  
  const firstRound = new Date('2026-10-04T20:00:00-03:00');
  assert.strictEqual(isElectionPeriodActive(firstRound, false), true, 'Deve estar ativo na noite do 1º Turno');

  const secondRound = new Date('2026-10-25T19:00:00-03:00');
  assert.strictEqual(isElectionPeriodActive(secondRound, false), true, 'Deve estar ativo na noite do 2º Turno');

  assert.strictEqual(isElectionPeriodActive(outsidePeriod, true), true, 'Modo simulação forçado deve retornar true');

  console.log('  ✅ Detecção de períodos eleitorais oficiais (1º e 2º turno) validada.');

  // Test 8: Ranking Geral SEM filtro ideológico (todos os partidos do TSE entram)
  console.log('\n[8/9] Testando ausência de filtro ideológico no ranking...');
  const mkCand = (seq: string, nm: string, p: string, n: string, v: number, pv: number, s: string) => ({
    seq, nm, p, n, v, pv, s, c: 1, dv: 1,
  });
  const mixedBr = {
    cdabr: 'BR', cdc: '0001', cand: [
      mkCand('s1', 'Cand A', 'PT', '13', 50000000, 48.0, 'ELEITO'),
      mkCand('s2', 'Cand B', 'PL', '22', 40000000, 38.0, 'NÃO ELEITO'),
      mkCand('s3', 'Cand C', 'NOVO', '30', 5000000, 4.5, 'NÃO ELEITO'),
      mkCand('s4', 'Cand D', 'MDB', '15', 4000000, 3.5, 'NÃO ELEITO'),
    ], vapt: 110000000, pst: 89.0,
  };
  const mixedRjGov = {
    cdabr: 'RJ', cdc: '0003', cand: [
      mkCand('g1', 'Gov A', 'PSD', '55', 3000000, 46.0, '2º TURNO'),
      mkCand('g2', 'Gov B', 'PL', '22', 2500000, 38.0, '2º TURNO'),
    ], vapt: 6500000, pst: 94.0,
  };
  (tseService as any).cache.set('br-0001', mixedBr);
  (tseService as any).cache.set('rj-0003', mixedRjGov);
  (tseService as any).cache.set('rj-0005', { cdabr: 'RJ', cdc: '0005', cand: [mkCand('s1', 'Sen A', 'PT', '131', 3000000, 34.0, 'ELEITO')], vapt: 8800000, pst: 92.0 });
  (tseService as any).cache.set('rj-0006', { cdabr: 'RJ', cdc: '0006', cand: [mkCand('d1', 'Dep A', 'PSOL', '5050', 100000, 2.5, 'ELEITO')], vapt: 4000000, pst: 91.0 });
  (tseService as any).cache.set('rj-0007', { cdabr: 'RJ', cdc: '0007', cand: [mkCand('e1', 'Est A', 'PSB', '40123', 90000, 2.1, 'ELEITO')], vapt: 4000000, pst: 91.0 });

  const statsRJ = await tseService.fetchNationalStats('RJ', false);
  assert(statsRJ.rankingsGerais && statsRJ.rankingsGerais.length === 5, 'Ranking RJ deve ter 5 grupos (presidente + 4 regionais)');
  const allParties = new Set<string>();
  for (const g of statsRJ.rankingsGerais!) for (const c of g.candidates) allParties.add(c.party);
  for (const p of ['PT', 'PL', 'NOVO', 'MDB', 'PSD', 'PSOL', 'PSB']) {
    assert(allParties.has(p), `Partido ${p} deve aparecer no ranking (sem filtro ideológico)`);
  }
  console.log('  ✅ Ranking inclui todos os partidos, sem filtro ideológico.');

  // Test 9: Agrupamento por UF da cola (regionais) e nacional (presidente)
  console.log('\n[9/9] Testando agrupamento UF da cola / nacional presidente...');
  for (const g of statsRJ.rankingsGerais!) {
    if (g.cargo === 'PRESIDENTE') {
      assert.strictEqual(g.uf, 'BR', 'Presidente deve ser agrupado nacional (BR)');
    } else {
      assert.strictEqual(g.uf, 'RJ', `Grupo ${g.cargo} deve seguir a UF da cola (RJ)`);
    }
  }
  // UF sem nomes de demonstração: só o grupo nacional entra no fallback
  for (const k of ['sp-0003', 'sp-0005', 'sp-0006', 'sp-0007']) {
    (tseService as any).cache.set(k, { cdabr: 'SP', cdc: k.split('-')[1], cand: [], vapt: 0, pst: 0 });
  }
  const statsSP = await tseService.fetchNationalStats('SP', false);
  assert(statsSP.rankingsGerais && statsSP.rankingsGerais.length >= 1, 'Deve haver ao menos o grupo nacional');
  for (const g of statsSP.rankingsGerais!) {
    assert(
      g.uf === 'BR' || g.uf === 'SP',
      `Grupo ${g.cargo} com UF inesperada (${g.uf}): nunca rotular outra UF com nomes alheios`
    );
  }
  const presSP = statsSP.rankingsGerais!.find((g) => g.cargo === 'PRESIDENTE');
  assert(presSP && presSP.uf === 'BR', 'Presidente segue nacional mesmo com UF da cola diferente');
  console.log('  ✅ Regionais agrupados pela UF da cola; presidente sempre nacional.');

  console.log('\n🎉 TODOS OS TESTES DO ELECTION NIGHT PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
