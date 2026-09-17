import { PIX_KEY, PIX_KEY_DISPLAY, PIX_KEY_TYPE, PIX_AMOUNT, PIX_BENEFICIARY_NAME, PIX_CITY } from '../constants/civic-support';

export interface CivicSupportRecord {
  hasContributed: boolean;
  contributionDate?: string;
  pixKey: string;
  pixKeyType: string;
  amount?: number;
  updatedAt: string;
}

const STORAGE_KEY = '@eleicoes_progressistas:civic_support';

// Memoria volátil para ambientes sem localStorage (SSR / Testes / Mobile puro)
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

/**
 * Obtem o estado de apoio civico do usuario com migracao transparente.
 * Regra de Ouro 4: Se existir chave anterior salva no storage, atualiza para
 * PIX_KEY na leitura, preservando hasContributed e contributionDate.
 */
export function getCivicSupportState(): CivicSupportRecord {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) {
    return {
      hasContributed: false,
      pixKey: PIX_KEY,
      pixKeyType: PIX_KEY_TYPE,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CivicSupportRecord>;
    const hasContributed = Boolean(parsed.hasContributed);
    const contributionDate = parsed.contributionDate;
    const currentKey = parsed.pixKey;

    // Se a chave salva for diferente da atual (ex: chave legada por email ou sem E.164), migra
    if (currentKey !== PIX_KEY) {
      const migrated: CivicSupportRecord = {
        hasContributed,
        contributionDate,
        pixKey: PIX_KEY,
        pixKeyType: PIX_KEY_TYPE,
        amount: typeof parsed.amount === 'number' ? parsed.amount : PIX_AMOUNT,
        updatedAt: new Date().toISOString(),
      };
      safeSetItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return {
      hasContributed,
      contributionDate,
      pixKey: PIX_KEY,
      pixKeyType: parsed.pixKeyType || PIX_KEY_TYPE,
      amount: typeof parsed.amount === 'number' ? parsed.amount : PIX_AMOUNT,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    const fallback: CivicSupportRecord = {
      hasContributed: false,
      pixKey: PIX_KEY,
      pixKeyType: PIX_KEY_TYPE,
      updatedAt: new Date().toISOString(),
    };
    safeSetItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

/**
 * Registra confirmacao ou intencao de contribuicao voluntaria
 */
export function recordContribution(amount: number = PIX_AMOUNT): CivicSupportRecord {
  const current = getCivicSupportState();
  const updated: CivicSupportRecord = {
    ...current,
    hasContributed: true,
    contributionDate: new Date().toISOString(),
    pixKey: PIX_KEY,
    pixKeyType: PIX_KEY_TYPE,
    amount,
    updatedAt: new Date().toISOString(),
  };
  safeSetItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Retorna os detalhes operacionais e de exibicao para o modal e banners
 */
export function getPixDetails() {
  const state = getCivicSupportState();
  return {
    ...state,
    keyDisplay: PIX_KEY_DISPLAY,
    beneficiaryName: PIX_BENEFICIARY_NAME,
    city: PIX_CITY,
    defaultAmount: PIX_AMOUNT,
  };
}
