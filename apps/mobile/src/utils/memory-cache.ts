export class MemoryCache<T> {
  private map = new Map<string, { value: T; expiresAt: number }>();
  constructor(private readonly ttlMs: number) {}
  get(key: string): T | null {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }
  set(key: string, value: T): void {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  delete(key: string): boolean {
    return this.map.delete(key);
  }
  clear(): void {
    this.map.clear();
  }
}
