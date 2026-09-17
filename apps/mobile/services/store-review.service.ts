import * as StoreReview from 'expo-store-review';

export interface StoreReviewState {
  activeSessionsCount: number;
  hasGeneratedPdf: boolean;
  lastPromptTimestamp: number | null;
}

export const STORE_REVIEW_STORAGE_KEY = '@eleicoes_progressistas:store_review_state';
export const REVIEW_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias (Google Play quota policy)
export const MIN_ACTIVE_SESSIONS = 3;

let memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

export function getStoreReviewState(): StoreReviewState {
  const raw = safeGetItem(STORE_REVIEW_STORAGE_KEY);
  if (!raw) {
    return {
      activeSessionsCount: 0,
      hasGeneratedPdf: false,
      lastPromptTimestamp: null,
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      activeSessionsCount: Number(parsed.activeSessionsCount) || 0,
      hasGeneratedPdf: Boolean(parsed.hasGeneratedPdf),
      lastPromptTimestamp: parsed.lastPromptTimestamp ? Number(parsed.lastPromptTimestamp) : null,
    };
  } catch {
    return {
      activeSessionsCount: 0,
      hasGeneratedPdf: false,
      lastPromptTimestamp: null,
    };
  }
}

export function saveStoreReviewState(state: StoreReviewState): void {
  safeSetItem(STORE_REVIEW_STORAGE_KEY, JSON.stringify(state));
}

export function resetStoreReviewState(): void {
  memoryStore = {};
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORE_REVIEW_STORAGE_KEY);
    }
  } catch {}
}

export const storeReviewService = {
  /**
   * Registra o início de uma nova sessão de uso ativa do usuário.
   */
  recordSession(): StoreReviewState {
    const current = getStoreReviewState();
    const updated: StoreReviewState = {
      ...current,
      activeSessionsCount: current.activeSessionsCount + 1,
    };
    saveStoreReviewState(updated);
    return updated;
  },

  /**
   * Registra a conclusão da geração ou download da cola eleitoral em PDF.
   */
  recordPdfGenerated(): StoreReviewState {
    const current = getStoreReviewState();
    const updated: StoreReviewState = {
      ...current,
      hasGeneratedPdf: true,
    };
    saveStoreReviewState(updated);
    return updated;
  },

  /**
   * Avalia os critérios de elegibilidade neutros:
   * 1. Respeito rigoroso à cota de 30 dias do Google Play.
   * 2. Engajamento neutro: pelo menos 3 sessões ativas OU geração de PDF da cola eleitoral.
   * NUNCA avalia sentimento, NPS ou resolução de problemas.
   */
  shouldPrompt(currentTime: number = Date.now()): boolean {
    const state = getStoreReviewState();

    // Regra de Cota: intervalo mínimo de 30 dias entre solicitações
    if (state.lastPromptTimestamp !== null) {
      const elapsed = currentTime - state.lastPromptTimestamp;
      if (elapsed < REVIEW_COOLDOWN_MS) {
        return false;
      }
    }

    // Marco neutro de engajamento
    const meetsSessionMilestone = state.activeSessionsCount >= MIN_ACTIVE_SESSIONS;
    const meetsPdfMilestone = state.hasGeneratedPdf;

    return meetsSessionMilestone || meetsPdfMilestone;
  },

  /**
   * Aciona a API oficial StoreReview.requestReview() caso os requisitos de conformidade sejam atendidos.
   * Retorna true se a chamada foi disparada ou false caso contrário.
   */
  async promptIfEligible(currentTime: number = Date.now()): Promise<boolean> {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) {
        return false;
      }

      if (!this.shouldPrompt(currentTime)) {
        return false;
      }

      // Atualiza timestamp da solicitação para manter cota de 30 dias
      const current = getStoreReviewState();
      saveStoreReviewState({
        ...current,
        lastPromptTimestamp: currentTime,
      });

      await StoreReview.requestReview();
      return true;
    } catch {
      return false;
    }
  },
};
