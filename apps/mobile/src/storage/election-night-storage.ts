import { ElectionResult, NationalStats, PollingPreferences } from '../types/election-night';

export const RESULTS_STORAGE_KEY = '@eleicoes_progressistas:election_results_2026';
export const POLLING_PREFS_STORAGE_KEY = '@eleicoes_progressistas:polling_prefs';
export const NATIONAL_STATS_STORAGE_KEY = '@eleicoes_progressistas:national_stats_2026';

// Storage em memória volátil para ambientes sem persistência nativa (SSR / testes Node)
let memoryStore: Record<string, string> = {};

export function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
}

export const electionNightStorage = {
  getResults(): Map<string, ElectionResult> {
    const raw = safeGetItem(RESULTS_STORAGE_KEY);
    if (!raw) return new Map<string, ElectionResult>();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Map<string, ElectionResult>(parsed);
      } else if (parsed && typeof parsed === 'object') {
        return new Map<string, ElectionResult>(Object.entries(parsed));
      }
    } catch {
      return new Map<string, ElectionResult>();
    }
    return new Map<string, ElectionResult>();
  },

  saveResults(results: Map<string, ElectionResult>): void {
    try {
      const entries = Array.from(results.entries());
      safeSetItem(RESULTS_STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  },

  getNationalStats(): NationalStats | null {
    const raw = safeGetItem(NATIONAL_STATS_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as NationalStats;
    } catch {
      return null;
    }
  },

  saveNationalStats(stats: NationalStats): void {
    try {
      safeSetItem(NATIONAL_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  },

  getPollingPrefs(): PollingPreferences {
    const raw = safeGetItem(POLLING_PREFS_STORAGE_KEY);
    if (!raw) {
      return { enabled: true, notifications: true };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled !== false,
        notifications: parsed.notifications !== false,
      };
    } catch {
      return { enabled: true, notifications: true };
    }
  },

  setPollingPrefs(prefs: PollingPreferences): void {
    try {
      safeSetItem(POLLING_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  },

  clearResults(): void {
    safeRemoveItem(RESULTS_STORAGE_KEY);
    safeRemoveItem(NATIONAL_STATS_STORAGE_KEY);
  },

  // Helper para testes e depuração
  _resetMemoryStore(): void {
    memoryStore = {};
  },
};
