import { APP_VERSION } from '../src/constants/app';

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
  payloadContext?: Record<string, any>;
  onStatusUpdate?: (message: string) => void;
}

export interface GeminiResponse {
  text: string;
  modelUsed: string;
  attemptsCount: number;
  usedFallback: boolean;
}

export interface SentryErrorContext {
  extra: {
    attemptedModel: string;
    retryCount: number;
    fallbackTriggered: boolean;
    sanitizedPayload: any;
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
 * Envia falha para o Sentry apenas quando TODAS as tentativas (inclusive fallback) falharem
 */
export function logToSentry(
  error: any,
  context: {
    model: string;
    attempts: number;
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
   * Executa a chamada à API com Retry Exponencial e Fallback de Modelo
   */
  public async generateContentWithRetryAndFallback(
    options: GeminiRequestOptions
  ): Promise<GeminiResponse> {
    const { prompt, onStatusUpdate, payloadContext } = options;
    let totalAttempts = 0;
    let currentModel = GEMINI_CONFIG.primaryModel;
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
        onStatusUpdate?.('');
        return {
          text,
          modelUsed: currentModel,
          attemptsCount: totalAttempts,
          usedFallback: false,
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
        onStatusUpdate?.('');
        return {
          text,
          modelUsed: currentModel,
          attemptsCount: totalAttempts,
          usedFallback: true,
        };
      } catch (fallbackErr: any) {
        lastError = fallbackErr;
      }
    }

    // FASE 3: Observabilidade Sentry se TODAS as tentativas (inclusive fallback) falharem
    logToSentry(lastError, {
      model: currentModel,
      attempts: totalAttempts,
      payload: payloadContext || { promptLength: prompt?.length },
      fallbackTriggered: usedFallback,
    });

    onStatusUpdate?.('');
    throw lastError || new Error(`Serviço temporariamente indisponível. Tente novamente em alguns momentos.`);
  }
}

export const geminiService = GeminiService.getInstance();
