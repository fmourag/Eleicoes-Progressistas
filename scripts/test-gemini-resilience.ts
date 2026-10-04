import assert from 'assert';
import {
  isRetryableApiError,
  sanitizePayloadForObservability,
  GEMINI_CONFIG,
  GeminiService,
} from '../apps/mobile/services/gemini.service';

console.log('🧪 Iniciando testes de resiliência e fallback da API Gemini (Resilience Suite v1.0)...');

async function runTests() {
  // Test 1: Detecção de erros retriáveis (503, 429, Unavailable, capacity)
  console.log('\n[1/4] Testando filtro de erros retriáveis (503/429/Capacity)...');
  assert.strictEqual(isRetryableApiError(new Error('API error (attempt 1): UNAVAILABLE (code 503): No capacity available for model gemini-3.6-flash-medium')), true);
  assert.strictEqual(isRetryableApiError(new Error('Resource exhausted: 429 Too Many Requests')), true);
  assert.strictEqual(isRetryableApiError(null, 503), true);
  assert.strictEqual(isRetryableApiError(null, 429), true);
  assert.strictEqual(isRetryableApiError(new Error('Invalid API Key')), false);
  console.log('  ✅ Filtro de identificação de falha de capacidade validado.');

  // Test 2: Anonimização de Payloads para Sentry (LGPD / GDPR Compliance)
  console.log('\n[2/4] Testando sanitização LGPD/GDPR para observabilidade...');
  const sensitivePayload = {
    userEmail: 'eleitor@gmail.com',
    cpf: '123.456.789-00',
    phone: '+5521999999999',
    promptSnippet: 'Analise candidatos do RJ',
  };
  const sanitized = sanitizePayloadForObservability(sensitivePayload);
  assert.strictEqual(sanitized.userEmail, '[ANONYMIZED_EMAIL]');
  assert.strictEqual(sanitized.cpf, '[ANONYMIZED_CPF]');
  assert.strictEqual(sanitized.phone, '[ANONYMIZED_PHONE]');
  assert.strictEqual(sanitized.promptSnippet, 'Analise candidatos do RJ');
  console.log('  ✅ Sanitização de dados pessoais para o Sentry validada com sucesso.');

  // Test 3: Configuração de modelos (Principal e Fallback)
  console.log('\n[3/4] Testando configurações de modelos...');
  assert.strictEqual(GEMINI_CONFIG.primaryModel, 'gemini-3.6-flash-medium');
  assert.strictEqual(GEMINI_CONFIG.fallbackModel, 'gemini-2.0-flash');
  assert.strictEqual(GEMINI_CONFIG.maxRetries, 3);
  assert.strictEqual(GEMINI_CONFIG.initialDelayMs, 1000);
  console.log('  ✅ Parâmetros de retry e fallback de modelo validados.');

  // Test 4: Simulação de chamada resiliente com mock fetch
  console.log('\n[4/4] Testando mecanismo de Retry e Fallback...');
  const service = GeminiService.getInstance();
  let statusUpdates: string[] = [];

  const originalFetch = globalThis.fetch;
  let fetchCount = 0;

  // Mock fetch para simular 503 nas primeiras 3 tentativas e sucesso na 4ª (fallback)
  globalThis.fetch = async (url: any) => {
    fetchCount++;
    const urlStr = String(url);
    if (fetchCount <= 3) {
      assert(urlStr.includes('gemini-3.6-flash-medium'), 'Tentativas 1-3 devem ser no modelo principal');
      return {
        ok: false,
        status: 503,
        text: async () => 'UNAVAILABLE: No capacity available for model gemini-3.6-flash-medium',
      } as any;
    } else {
      assert(urlStr.includes('gemini-2.0-flash'), 'Tentativa 4 deve ser no modelo de fallback gemini-2.0-flash');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: 'Resposta gerada com sucesso via fallback.' }] } },
          ],
        }),
      } as any;
    }
  };

  try {
    const response = await service.generateContentWithRetryAndFallback({
      prompt: 'Teste de resiliência',
      onStatusUpdate: (msg) => {
        if (msg) statusUpdates.push(msg);
      },
    });

    assert.strictEqual(response.usedFallback, true, 'Deve indicar uso do fallback');
    assert.strictEqual(response.modelUsed, 'gemini-2.0-flash');
    assert.strictEqual(response.text, 'Resposta gerada com sucesso via fallback.');
    assert(statusUpdates.some((s) => s.includes('Otimizando resposta')), 'Deve notificar atualização de status reativa para a UI');
    console.log('  ✅ Execução com Retry + Fallback automatizado concluída com sucesso!');
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log('\n🎉 TODOS OS TESTES DO SUITE DE RESILIÊNCIA GEMINI PASSARAM COM 100% DE SUCESSO!\n');
}

runTests().catch((err) => {
  console.error('❌ Erro no teste de resiliência:', err);
  process.exit(1);
});
