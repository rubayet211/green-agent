import { describe, expect, it } from "vitest";
import { z } from "zod";
import { apiErrorResponse, readJsonBody } from "./api";

describe("readJsonBody", () => {
  it("rejects bodies larger than the configured maximum", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "too large" }),
    });

    await expect(
      readJsonBody(request, z.object({ value: z.string() }), 5),
    ).rejects.toMatchObject({ status: 413, code: "PAYLOAD_TOO_LARGE" });
  });

  it("maps invalid input to a safe 400 response", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 123 }),
    });

    let caught: unknown;
    try {
      await readJsonBody(request, z.object({ value: z.string() }));
    } catch (error) {
      caught = error;
    }

    const response = apiErrorResponse(caught);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request data.",
      code: "INVALID_REQUEST",
    });
  });
});
