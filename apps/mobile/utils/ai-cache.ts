export const DEFAULT_AI_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos por padrão

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
  model: string;
  key: string;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRatePercent: number;
}

const STORAGE_KEY = '@eleicoes_progressistas:ai_prompt_cache_v1';

/**
 * Detecta se o prompt contém dados pessoais (PII) sensíveis
 */
export function containsPii(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
  const phoneRegex = /\+?\d{10,13}/;
  return emailRegex.test(text) || cpfRegex.test(text) || phoneRegex.test(text);
}

/**
 * Sanitiza o prompt removendo PII antes da geração de hash para o cache
 */
export function sanitizePromptForCacheKey(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  return prompt
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF]')
    .replace(/\+?\d{10,13}/g, '[PHONE]')
    .trim()
    .toLowerCase();
}

/**
 * Gera um hash numérico rápido e consistente (FNV-1a 32-bit) para servir de chave de cache
 */
export function simpleHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Gera uma chave de cache única a partir de (modelo, prompt sanitizado, opções)
 */
export function generateCacheKey(model: string, prompt: string, options?: Record<string, any>): string {
  const sanitizedPrompt = sanitizePromptForCacheKey(prompt);
  const rawKeyString = `${model.toLowerCase()}:${sanitizedPrompt}:${JSON.stringify(options || {})}`;
  return `aicache_${simpleHash(rawKeyString)}`;
}

export class AiCacheManager {
  private static instance: AiCacheManager;
  private memoryMap = new Map<string, CacheEntry>();
  private hitsCount = 0;
  private missesCount = 0;

  constructor() {
    this.loadFromStorageSilently();
  }

  public static getInstance(): AiCacheManager {
    if (!AiCacheManager.instance) {
      AiCacheManager.instance = new AiCacheManager();
    }
    return AiCacheManager.instance;
  }

  /**
   * Tenta recuperar uma resposta do cache
   */
  public getFromCache<T = string>(key: string): T | null {
    const entry = this.memoryMap.get(key);
    if (!entry) {
      this.missesCount++;
      return null;
    }

    // Validação do TTL
    if (Date.now() > entry.expiresAt) {
      this.memoryMap.delete(key);
      this.missesCount++;
      this.persistToStorageSilently();
      return null;
    }

    this.hitsCount++;
    return entry.value as T;
  }

  /**
   * Salva uma resposta no cache com TTL dinâmico
   */
  public setInCache<T = string>(key: string, value: T, model: string, ttlMs = DEFAULT_AI_CACHE_TTL_MS): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      model,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };

    this.memoryMap.set(key, entry);
    this.persistToStorageSilently();
  }

  /**
   * Remove entradas expiradas
   */
  public clearExpired(): void {
    const now = Date.now();
    for (const [k, v] of this.memoryMap.entries()) {
      if (now > v.expiresAt) {
        this.memoryMap.delete(k);
      }
    }
    this.persistToStorageSilently();
  }

  /**
   * Limpa todo o cache
   */
  public clearAll(): void {
    this.memoryMap.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    try {
      const storageModule = require('../src/storage/app-storage');
      if (storageModule && storageModule.AppStorage) {
        storageModule.AppStorage.removeItem(STORAGE_KEY).catch(() => {});
      }
    } catch {}
  }

  /**
   * Retorna estatísticas de performance do cache (Cache Hit Rate)
   */
  public getStats(): CacheStats {
    const total = this.hitsCount + this.missesCount;
    const hitRatePercent = total > 0 ? parseFloat(((this.hitsCount / total) * 100).toFixed(2)) : 0;
    return {
      size: this.memoryMap.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatePercent,
    };
  }

  private loadFromStorageSilently(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CacheEntry[];
          if (Array.isArray(parsed)) {
            const now = Date.now();
            for (const item of parsed) {
              if (item && item.expiresAt > now) {
                this.memoryMap.set(item.key, item);
              }
            }
          }
        }
      } catch {}
    }

    try {
      const storageModule = require('../src/storage/app-storage');
      if (storageModule && storageModule.AppStorage) {
        storageModule.AppStorage.getItem(STORAGE_KEY).then((raw: string | null) => {
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as CacheEntry[];
              if (Array.isArray(parsed)) {
                const now = Date.now();
                for (const item of parsed) {
                  if (item && item.expiresAt > now && !this.memoryMap.has(item.key)) {
                    this.memoryMap.set(item.key, item);
                  }
                }
              }
            } catch {}
          }
        }).catch(() => {});
      }
    } catch {}
  }

  private persistToStorageSilently(): void {
    try {
      const activeEntries = Array.from(this.memoryMap.values()).filter((e) => e.expiresAt > Date.now());
      const serialized = JSON.stringify(activeEntries);

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, serialized);
        } catch {}
      }
      try {
        const storageModule = require('../src/storage/app-storage');
        if (storageModule && storageModule.AppStorage) {
          storageModule.AppStorage.setItem(STORAGE_KEY, serialized).catch(() => {});
        }
      } catch {}
    } catch {}
  }
}

export const aiCache = AiCacheManager.getInstance();
