import { APP_VERSION } from '../src/constants/app';
import { aiCache, generateCacheKey, containsPii } from '../utils/ai-cache';

export const GEMINI_CONFIG = {
  primaryModel: process.env.EXPO_PUBLIC_GEMINI_PRIMARY_MODEL || 'gemini-3.6-flash-medium',
  fallbackModel: process.env.EXPO_PUBLIC_GEMINI_FALLBACK_MODEL || 'gemini-2.0-flash',
  maxRetries: 3,
  initialDelayMs: 1000,
};

export interface GeminiRequestOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  ttlMs?: number;
  skipCache?: boolean;
  payloadContext?: Record<string, any>;
  onStatusUpdate?: (message: string) => void;
}

export interface GeminiResponse {
  text: string;
  modelUsed: string;
  attemptsCount: number;
  usedFallback: boolean;
  isCacheHit: boolean;
  latencyMs: number;
}

export interface SentryErrorContext {
  extra: {
    attemptedModel: string;
    retryCount: number;
    fallbackTriggered: boolean;
    sanitizedPayload: any;
    latencyMs?: number;
  };
  tags: {
    service: string;
    failureType: string;
  };
}

/**
 * Verifica se o erro retornado é uma falha de capacidade, rate limit ou indisponibilidade (503/429)
 */
export function isRetryableApiError(error: any, status?: number): boolean {
  if (status === 503 || status === 429) return true;
  const message = (error?.message || String(error || '')).toLowerCase();
  return (
    message.includes('503') ||
    message.includes('429') ||
    message.includes('unavailable') ||
    message.includes('no capacity available') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit') ||
    message.includes('overloaded') ||
    message.includes('gemini-3.6-flash-medium')
  );
}

/**
 * Anonimiza payloads para observabilidade mantendo conformidade estrita com LGPD / GDPR
 */
export function sanitizePayloadForObservability(payload: any): any {
  if (!payload) return {};
  if (typeof payload === 'string') {
    return payload
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[ANONYMIZED_EMAIL]')
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[ANONYMIZED_CPF]')
      .replace(/\+?\d{10,13}/g, '[ANONYMIZED_PHONE]');
  }
  if (typeof payload === 'object') {
    const clone: Record<string, any> = Array.isArray(payload) ? [] : {};
    for (const [k, v] of Object.entries(payload)) {
      const lowerKey = k.toLowerCase();
      if (lowerKey.includes('cpf')) {
        clone[k] = '[ANONYMIZED_CPF]';
      } else if (lowerKey.includes('email')) {
        clone[k] = '[ANONYMIZED_EMAIL]';
      } else if (lowerKey.includes('phone') || lowerKey.includes('telefone')) {
        clone[k] = '[ANONYMIZED_PHONE]';
      } else if (lowerKey.includes('senha') || lowerKey.includes('token') || lowerKey.includes('secret')) {
        clone[k] = '[ANONYMIZED]';
      } else if (typeof v === 'string') {
        clone[k] = sanitizePayloadForObservability(v);
      } else if (typeof v === 'object' && v !== null) {
        clone[k] = sanitizePayloadForObservability(v);
      } else {
        clone[k] = v;
      }
    }
    return clone;
  }
  return payload;
}

/**
 * Registra métricas estruturadas de performance no Sentry para monitoramento em Dashboard
 */
export function logMetricsToSentry(context: {
  isCacheHit: boolean;
  modelUsed: string;
  isFallback: boolean;
  latencyMs: number;
  attemptsCount: number;
  payloadContext?: any;
}): void {
  const sanitized = sanitizePayloadForObservability(context.payloadContext);
  const tags = {
    ai_cache_hit: String(context.isCacheHit),
    ai_model_used: context.modelUsed,
    ai_is_fallback: String(context.isFallback),
  };
  const extra = {
    ai_latency_ms: context.latencyMs,
    ai_attempts_count: context.attemptsCount,
    sanitizedPayload: sanitized,
  };

  try {
    const globalObj = globalThis as any;
    const Sentry = globalObj.Sentry || (typeof require !== 'undefined' ? (require('@sentry/react-native') || require('@sentry/browser')) : null);
    if (Sentry && typeof Sentry.setContext === 'function') {
      Sentry.setContext('ai_metrics', { ...tags, ...extra });
    }
  } catch {}

  console.log(`[Sentry Metrics] CacheHit: ${context.isCacheHit} | Model: ${context.modelUsed} | Latency: ${context.latencyMs}ms`);
}

/**
 * Envia falha para o Sentry apenas quando TODAS as tentativas (inclusive fallback) falharem
 */
export function logToSentry(
  error: any,
  context: {
    model: string;
    attempts: number;
    latencyMs?: number;
    payload: any;
    fallbackTriggered: boolean;
  }
): void {
  const sanitized = sanitizePayloadForObservability(context.payload);
  const sentryContext: SentryErrorContext = {
    extra: {
      attemptedModel: context.model,
      retryCount: context.attempts,
      fallbackTriggered: context.fallbackTriggered,
      latencyMs: context.latencyMs,
      sanitizedPayload: sanitized,
    },
    tags: {
      service: 'gemini-ai-resilience',
      failureType: 'api_capacity_exhausted',
    },
  };

  try {
    const globalObj = globalThis as any;
    const Sentry = globalObj.Sentry || (typeof require !== 'undefined' ? (require('@sentry/react-native') || require('@sentry/browser')) : null);
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error, sentryContext);
      return;
    }
  } catch {}

  console.error('[Sentry Observability Alert]', error?.message || error, JSON.stringify(sentryContext));
}

export class GeminiService {
  private static instance: GeminiService;

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Executa a requisição individual para a API do Gemini
   */
  private async executeFetch(model: string, prompt: string, options?: GeminiRequestOptions): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const url = `${endpoint}?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `EleicoesProgressistas/${APP_VERSION.replace(/^v/, '')} (GeminiResilienceClient)`,
        },
        body: JSON.stringify({
          contents: [
            ...(options?.systemInstruction ? [{ role: 'system', parts: [{ text: options.systemInstruction }] }] : []),
            { role: 'user', parts: [{ text: prompt }] },
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? 1024,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const err = new Error(`API error (attempt): HTTP status ${response.status} for model ${model}: ${errorText}`);
        (err as any).status = response.status;
        throw err;
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error(`Resposta vazia retornada pelo modelo ${model}`);
      }

      return generatedText;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Executa a chamada à API com Cache Dinâmico TTL, Retry Exponencial e Fallback de Modelo
   */
  public async generateContentWithRetryAndFallback(
    options: GeminiRequestOptions
  ): Promise<GeminiResponse> {
    const startTime = Date.now();
    const { prompt, onStatusUpdate, payloadContext, ttlMs, skipCache } = options;
    const primaryModel = GEMINI_CONFIG.primaryModel;

    // 1. Geração da chave de cache e verificação de PII
    const cacheKey = generateCacheKey(primaryModel, prompt, {
      systemInstruction: options.systemInstruction,
      temperature: options.temperature,
    });

    // 2. Verificação de Cache Hit (somente se não houver PII e skipCache = false)
    if (!skipCache && !containsPii(prompt)) {
      const cachedText = aiCache.getFromCache<string>(cacheKey);
      if (cachedText) {
        const latencyMs = Date.now() - startTime;
        onStatusUpdate?.('Resposta recuperada do cache');

        logMetricsToSentry({
          isCacheHit: true,
          modelUsed: primaryModel,
          isFallback: false,
          latencyMs,
          attemptsCount: 0,
          payloadContext,
        });

        return {
          text: cachedText,
          modelUsed: primaryModel,
          attemptsCount: 0,
          usedFallback: false,
          isCacheHit: true,
          latencyMs,
        };
      }
    }

    // 3. Em caso de Cache Miss, prossegue com a chamada resiliente à API
    let totalAttempts = 0;
    let currentModel = primaryModel;
    let usedFallback = false;
    let lastError: any = null;

    // FASE 1: 3 Tentativas com Backoff Exponencial no Modelo Principal (gemini-3.6-flash-medium)
    for (let attempt = 1; attempt <= GEMINI_CONFIG.maxRetries; attempt++) {
      totalAttempts++;
      try {
        if (attempt > 1) {
          onStatusUpdate?.(`Otimizando resposta, aguarde um instante... (tentativa ${attempt}/${GEMINI_CONFIG.maxRetries})`);
        } else {
          onStatusUpdate?.('Processando requisição de IA...');
        }

        const text = await this.executeFetch(currentModel, prompt, options);
        const latencyMs = Date.now() - startTime;

        // Salva a resposta gerada no cache dinâmico com TTL
        if (!containsPii(prompt)) {
          aiCache.setInCache(cacheKey, text, currentModel, ttlMs);
        }

        logMetricsToSentry({
          isCacheHit: false,
          modelUsed: currentModel,
          isFallback: false,
          latencyMs,
          attemptsCount: totalAttempts,
          payloadContext,
        });

        onStatusUpdate?.('');
        return {
          text,
          modelUsed: currentModel,
          attemptsCount: totalAttempts,
          usedFallback: false,
          isCacheHit: false,
          latencyMs,
        };
      } catch (err: any) {
        lastError = err;
        const isRetryable = isRetryableApiError(err, err?.status);

        if (!isRetryable || attempt === GEMINI_CONFIG.maxRetries) {
          break;
        }

        // Backoff Exponencial: 1s, 2s, 4s
        const delayMs = GEMINI_CONFIG.initialDelayMs * Math.pow(2, attempt - 1);
        onStatusUpdate?.(`Otimizando resposta, aguarde um instante...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // FASE 2: Fallback para Modelo Secundário (gemini-2.0-flash) se o modelo principal estiver sem capacidade (503/429)
    if (isRetryableApiError(lastError, lastError?.status)) {
      usedFallback = true;
      currentModel = GEMINI_CONFIG.fallbackModel;
      totalAttempts++;

      onStatusUpdate?.(`Otimizando resposta via servidor auxiliar, aguarde um instante...`);
      try {
        const text = await this.executeFetch(currentModel, prompt, options);
        const latencyMs = Date.now() - startTime;

        // Salva no cache mesmo quando for gerado via fallback
        if (!containsPii(prompt)) {
          aiCache.setInCache(cacheKey, text, currentModel, ttlMs);
        }

        logMetricsToSentry({
          isCacheHit: false,
          modelUsed: currentModel,
          isFallback: true,
          latencyMs,
          attemptsCount: totalAttempts,
          payloadContext,
        });

        onStatusUpdate?.('');
        return {
          text,
          modelUsed: currentModel,
          attemptsCount: totalAttempts,
          usedFallback: true,
          isCacheHit: false,
          latencyMs,
        };
      } catch (fallbackErr: any) {
        lastError = fallbackErr;
      }
    }

    // FASE 3: Observabilidade Sentry se TODAS as tentativas (inclusive fallback) falharem
    const finalLatency = Date.now() - startTime;
    logToSentry(lastError, {
      model: currentModel,
      attempts: totalAttempts,
      latencyMs: finalLatency,
      payload: payloadContext || { promptLength: prompt?.length },
      fallbackTriggered: usedFallback,
    });

    onStatusUpdate?.('');
    throw lastError || new Error(`Serviço temporariamente indisponível. Tente novamente em alguns momentos.`);
  }
}

export const geminiService = GeminiService.getInstance();
