import { afterEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";

async function loadHistoryRoute(identity: string | null = OWNER_ID) {
  vi.resetModules();
  const getHistory = vi.fn().mockResolvedValue([{ id: "session-1" }]);
  vi.doMock("@/lib/security/identity", () => ({
    getRequestIdentity: () => identity,
  }));
  vi.doMock("@/lib/firebase/sessions", () => ({
    sessionStore: { getHistory },
  }));
  const route = await import("./route");
  return { GET: route.GET, getHistory };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("GET /api/history", () => {
  it("loads only history for the signed anonymous user", async () => {
    const { GET, getHistory } = await loadHistoryRoute();

    const response = await GET(new Request("http://localhost/api/history"));

    expect(response.status).toBe(200);
    expect(getHistory).toHaveBeenCalledWith(OWNER_ID);
    await expect(response.json()).resolves.toEqual([{ id: "session-1" }]);
  });

  it("requires anonymous identity", async () => {
    const { GET } = await loadHistoryRoute(null);

    const response = await GET(new Request("http://localhost/api/history"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "IDENTITY_REQUIRED",
    });
  });
});
