import { afterEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "00000000-0000-4000-8000-000000000000";

async function loadSessionRoute(session: unknown = { id: SESSION_ID }) {
  vi.resetModules();
  const getOwnedSession = vi.fn().mockResolvedValue(session);
  vi.doMock("@/lib/security/identity", () => ({
    getRequestIdentity: () => OWNER_ID,
  }));
  vi.doMock("@/lib/firebase/sessions", () => ({
    sessionStore: { getOwnedSession },
  }));
  const route = await import("./route");
  return { GET: route.GET, getOwnedSession };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("GET /api/session/[id]", () => {
  it("loads only a session owned by the signed anonymous user", async () => {
    const { GET, getOwnedSession } = await loadSessionRoute();

    const response = await GET(new Request(`http://localhost/api/session/${SESSION_ID}`), {
      params: Promise.resolve({ id: SESSION_ID }),
    });

    expect(response.status).toBe(200);
    expect(getOwnedSession).toHaveBeenCalledWith(SESSION_ID, OWNER_ID);
    await expect(response.json()).resolves.toEqual({ id: SESSION_ID });
  });

  it("returns 404 when the session is absent or owned by someone else", async () => {
    const { GET } = await loadSessionRoute(null);

    const response = await GET(new Request(`http://localhost/api/session/${SESSION_ID}`), {
      params: Promise.resolve({ id: SESSION_ID }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      code: "SESSION_NOT_FOUND",
    });
  });
});
