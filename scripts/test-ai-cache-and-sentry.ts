import assert from 'assert';
import {
  aiCache,
  generateCacheKey,
  containsPii,
  sanitizePromptForCacheKey,
  DEFAULT_AI_CACHE_TTL_MS,
} from '../apps/mobile/utils/ai-cache';
import {
  GeminiService,
  sanitizePayloadForObservability,
  isRetryableApiError,
} from '../apps/mobile/services/gemini.service';

console.log('🧪 Iniciando testes do Cache Dinâmico de IA (Token Economy) & Observabilidade Sentry...');

async function runTests() {
  // Test 1: Geração de Chave de Cache e PII Detection
  console.log('\n[1/5] Testando detecção de PII e sanitização de chave de cache...');
  assert.strictEqual(containsPii('Consulta para usuario@email.com'), true);
  assert.strictEqual(containsPii('Consulta com CPF 123.456.789-00'), true);
  assert.strictEqual(containsPii('Consulta sem PII para candidato do RJ'), false);

  const sanitizedKeyPrompt = sanitizePromptForCacheKey('Resumo para usuario@email.com do candidato RJ');
  assert.strictEqual(sanitizedKeyPrompt.includes('usuario@email.com'), false);
  assert.strictEqual(sanitizedKeyPrompt.includes('[email]'), true);
  console.log('  ✅ Geração de chave de cache com proteção contra PII validada.');

  // Test 2: Operações de Cache (Hit, Miss e Expiração TTL)
  console.log('\n[2/5] Testando utilitário de Cache Dinâmico em memória...');
  aiCache.clearAll();
  const testKey = generateCacheKey('gemini-3.6-flash-medium', 'Prompt de teste de candidatos');

  assert.strictEqual(aiCache.getFromCache(testKey), null, 'Chave inexistente deve retornar null (miss)');
  aiCache.setInCache(testKey, 'Resposta da IA em cache', 'gemini-3.6-flash-medium', 100); // 100ms TTL

  assert.strictEqual(aiCache.getFromCache(testKey), 'Resposta da IA em cache', 'Chave gravada deve retornar a resposta (hit)');

  // Aguarda expiração do TTL (100ms)
  await new Promise((r) => setTimeout(r, 120));
  assert.strictEqual(aiCache.getFromCache(testKey), null, 'Chave expirada deve retornar null');

  const stats = aiCache.getStats();
  assert(stats.hits >= 1, 'Estatísticas de hits registradas corretamente');
  assert(stats.misses >= 2, 'Estatísticas de misses registradas corretamente');
  console.log(`  ✅ Cache operando com sucesso! Hit Rate: ${stats.hitRatePercent}%`);

  // Test 3: Integração do GeminiService com Cache Hit (Token Economy)
  console.log('\n[3/5] Testando Token Economy no GeminiService (Cache Hit)...');
  aiCache.clearAll();
  const geminiService = GeminiService.getInstance();
  const promptText = 'Resumo dos candidatos a governador no Rio de Janeiro';

  const cacheKey = generateCacheKey('gemini-3.6-flash-medium', promptText, {
    systemInstruction: 'Instrução do sistema',
    temperature: 0.2,
  });
  aiCache.setInCache(cacheKey, 'Resposta pré-carregada para economia de tokens', 'gemini-3.6-flash-medium');

  let statusMsg = '';
  const response = await geminiService.generateContentWithRetryAndFallback({
    prompt: promptText,
    systemInstruction: 'Instrução do sistema',
    temperature: 0.2,
    onStatusUpdate: (msg) => { statusMsg = msg; },
  });

  assert.strictEqual(response.isCacheHit, true, 'Deve indicar que a resposta foi recuperada do cache');
  assert.strictEqual(response.text, 'Resposta pré-carregada para economia de tokens');
  assert.strictEqual(response.attemptsCount, 0, 'Zero chamadas de rede no cache hit');
  assert.strictEqual(statusMsg, 'Resposta recuperada do cache');
  console.log('  ✅ Resposta recuperada do cache instantaneamente com 0 chamadas de API.');

  // Test 4: Gravação no Cache em caso de Cache Miss com Sucesso na API
  console.log('\n[4/5] Testando gravação automática no cache em caso de Cache Miss...');
  aiCache.clearAll();
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;

  globalThis.fetch = async () => {
    networkCalls++;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Texto gerado via API ao vivo' }] } }],
      }),
    } as any;
  };

  try {
    const liveResponse1 = await geminiService.generateContentWithRetryAndFallback({
      prompt: 'Prompt novo ao vivo 1',
    });
    assert.strictEqual(liveResponse1.isCacheHit, false);
    assert.strictEqual(liveResponse1.text, 'Texto gerado via API ao vivo');
    assert.strictEqual(networkCalls, 1);

    // Segunda chamada com o mesmo prompt deve bater no cache gravado
    const liveResponse2 = await geminiService.generateContentWithRetryAndFallback({
      prompt: 'Prompt novo ao vivo 1',
    });
    assert.strictEqual(liveResponse2.isCacheHit, true);
    assert.strictEqual(liveResponse2.text, 'Texto gerado via API ao vivo');
    assert.strictEqual(networkCalls, 1, 'Segunda chamada não deve realizar nova requisição de rede');
    console.log('  ✅ Gravação e reaproveitamento de cache ao vivo validados.');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // Test 5: Sanitização de Payloads Sensíveis para Observabilidade (LGPD)
  console.log('\n[5/5] Testando sanitização de payloads sensíveis em métricas Sentry...');
  const sensitiveContext = {
    cpf: '987.654.321-99',
    userEmail: 'teste.lgpd@exemplo.com.br',
    phone: '+5511988887777',
    promptSnippet: 'Analise candidatos de SP',
  };
  const sanitizedContext = sanitizePayloadForObservability(sensitiveContext);
  assert.strictEqual(sanitizedContext.cpf, '[ANONYMIZED_CPF]');
  assert.strictEqual(sanitizedContext.userEmail, '[ANONYMIZED_EMAIL]');
  assert.strictEqual(sanitizedContext.phone, '[ANONYMIZED_PHONE]');
  assert.strictEqual(sanitizedContext.promptSnippet, 'Analise candidatos de SP');
  console.log('  ✅ Conformidade total com LGPD/GDPR validada nas métricas do Sentry.');

  console.log('\n🎉 TODOS OS TESTES DE CACHE DE IA & OBSERVABILIDADE SENTRY PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Erro no teste de cache e observabilidade:', err);
  process.exit(1);
});
