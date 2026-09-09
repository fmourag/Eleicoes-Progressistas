import { CacheAdapter } from './cache.adapter';

export class MemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, { value: any; expiresAt: number | null }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiresAt !== null && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
