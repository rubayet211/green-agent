import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "./rate-limit";

describe("MemoryRateLimiter", () => {
  it("rejects requests after the configured limit", () => {
    const limiter = new MemoryRateLimiter();
    const options = { limit: 2, windowMs: 1_000 };

    expect(limiter.consume("user", options, 0).allowed).toBe(true);
    expect(limiter.consume("user", options, 1).allowed).toBe(true);
    expect(limiter.consume("user", options, 2).allowed).toBe(false);
  });

  it("starts a new window after expiry", () => {
    const limiter = new MemoryRateLimiter();
    const options = { limit: 1, windowMs: 1_000 };

    limiter.consume("user", options, 0);

    expect(limiter.consume("user", options, 1_001).allowed).toBe(true);
  });
});
