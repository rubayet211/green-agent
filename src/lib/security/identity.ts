import crypto from "node:crypto";

export const IDENTITY_COOKIE_NAME = "greenagent_identity";

const IDENTITY_TTL_MS = 365 * 24 * 60 * 60 * 1_000;
const DEVELOPMENT_SECRET = "greenagent-development-only-identity-secret";

function getIdentitySecret(): string {
  const configured = process.env.ANONYMOUS_SESSION_SECRET;
  if (configured?.length && configured.length >= 32) return configured;
  if (configured) {
    throw new Error("ANONYMOUS_SESSION_SECRET must be at least 32 characters.");
  }
  if (process.env.NODE_ENV !== "production") return DEVELOPMENT_SECRET;
  throw new Error("ANONYMOUS_SESSION_SECRET must be configured in production.");
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getIdentitySecret())
    .update(payload)
    .digest("base64url");
}

export function createIdentityToken(
  id: string = crypto.randomUUID(),
  now = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({ id, expiresAt: now + IDENTITY_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyIdentityToken(token: string, now = Date.now()): string | null {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      id?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= now
    ) {
      return null;
    }
    return parsed.id;
  } catch {
    return null;
  }
}

export function getRequestIdentity(request: Request): string | null {
  const cookies = request.headers.get("cookie");
  if (!cookies) return null;

  const token = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${IDENTITY_COOKIE_NAME}=`))
    ?.slice(IDENTITY_COOKIE_NAME.length + 1);

  return token ? verifyIdentityToken(token) : null;
}

export function buildIdentityCookie(
  token: string,
  secure = process.env.NODE_ENV === "production",
): string {
  const attributes = [
    `${IDENTITY_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${Math.floor(IDENTITY_TTL_MS / 1_000)}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}
