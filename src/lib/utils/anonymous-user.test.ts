import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureAnonymousIdentity } from "./anonymous-user";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ensureAnonymousIdentity", () => {
  it("bootstraps a server-signed HttpOnly identity", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await ensureAnonymousIdentity();

    expect(fetchMock).toHaveBeenCalledWith("/api/identity", {
      method: "POST",
      credentials: "same-origin",
    });
  });

  it("throws when identity bootstrap fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(ensureAnonymousIdentity()).rejects.toThrow(
      "Unable to initialize anonymous identity.",
    );
  });
});
