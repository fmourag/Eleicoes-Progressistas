import { Platform } from 'react-native';

/**
 * Utilitário de persistência leve e auditável.
 * No ambiente Web utiliza localStorage; no ambiente Mobile nativo utiliza memória volátil global
 * sem dependências nativas adicionais, garantindo 100% de estabilidade de compilação no Gradle.
 */
const memoryFallback = new Map<string, string>();

export const AppStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
      return memoryFallback.get(key) ?? null;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryFallback.set(key, value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    try {
      memoryFallback.delete(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
};
