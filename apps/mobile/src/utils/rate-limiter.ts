export class RateLimiter {
  private lastCall = 0;
  constructor(private readonly intervalMs: number) {}
  async wait(): Promise<void> {
    const now = Date.now();
    const wait = this.intervalMs - (now - this.lastCall);
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }
    this.lastCall = Date.now();
  }
}
