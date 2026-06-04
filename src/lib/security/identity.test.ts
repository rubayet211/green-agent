import { afterEach, describe, expect, it } from "vitest";
import {
  buildIdentityCookie,
  createIdentityToken,
  verifyIdentityToken,
} from "./identity";

const originalSecret = process.env.ANONYMOUS_SESSION_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.ANONYMOUS_SESSION_SECRET;
  else process.env.ANONYMOUS_SESSION_SECRET = originalSecret;
});

describe("anonymous identity tokens", () => {
  it("verifies an untampered signed identity", () => {
    process.env.ANONYMOUS_SESSION_SECRET = "test-secret-with-enough-entropy-123456";
    const token = createIdentityToken("user-123", 1_000);

    expect(verifyIdentityToken(token, 1_001)).toBe("user-123");
  });

  it("rejects a tampered identity", () => {
    process.env.ANONYMOUS_SESSION_SECRET = "test-secret-with-enough-entropy-123456";
    const token = createIdentityToken("user-123", 1_000);

    expect(verifyIdentityToken(`${token}tampered`, 1_001)).toBeNull();
  });

  it("builds an HttpOnly same-site cookie", () => {
    const cookie = buildIdentityCookie("signed-token", false);

    expect(cookie).toContain("greenagent_identity=signed-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("rejects weak configured secrets", () => {
    process.env.ANONYMOUS_SESSION_SECRET = "too-short";

    expect(() => createIdentityToken()).toThrow("at least 32 characters");
  });
});
