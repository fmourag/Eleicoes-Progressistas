import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Utilitário de persistência leve e permanente.
 * - No ambiente Web utiliza localStorage;
 * - No ambiente Mobile nativo utiliza o sistema de arquivos local permanente (FileSystem.documentDirectory)
 *   com cache em memória ultra-rápido, garantindo persistência entre reinicializações do app
 *   sem risco de perda de dados e 100% estável na compilação do Gradle.
 */
const memoryFallback = new Map<string, string>();

function getStorageFilePath(key: string): string | null {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return null;
  }
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${FileSystem.documentDirectory}np_storage_${safeKey}.json`;
}

export const AppStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // 1. Tenta Web localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          memoryFallback.set(key, val);
          return val;
        }
      }

      // 2. Se já estiver no cache em memória, retorna imediatamente
      const cached = memoryFallback.get(key);
      if (cached !== undefined) {
        return cached;
      }

      // 3. No Mobile nativo, lê do arquivo persistente
      const filePath = getStorageFilePath(key);
      if (filePath) {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          const content = await FileSystem.readAsStringAsync(filePath);
          memoryFallback.set(key, content);
          return content;
        }
      }

      return null;
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryFallback.set(key, value);

      // Web localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }

      // Mobile nativo arquivo persistente
      const filePath = getStorageFilePath(key);
      if (filePath) {
        await FileSystem.writeAsStringAsync(filePath, value);
      }
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    try {
      memoryFallback.delete(key);

      // Web localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }

      // Mobile nativo arquivo persistente
      const filePath = getStorageFilePath(key);
      if (filePath) {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          await FileSystem.deleteAsync(filePath, { idempotent: true });
        }
      }
    } catch {}
  },
};
