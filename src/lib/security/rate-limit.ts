interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  consume(
    key: string,
    options: RateLimitOptions,
    now = Date.now(),
  ): RateLimitResult {
    const current = this.entries.get(key);
    const entry =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + options.windowMs }
        : current;

    entry.count += 1;
    this.entries.set(key, entry);

    return {
      allowed: entry.count <= options.limit,
      remaining: Math.max(options.limit - entry.count, 0),
      retryAfterSeconds: Math.max(Math.ceil((entry.resetAt - now) / 1_000), 1),
    };
  }
}

export const apiRateLimiter = new MemoryRateLimiter();
