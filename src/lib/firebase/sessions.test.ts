import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GreenAgentSession } from "@/types/greenagent";

const OWNER_A = "11111111-1111-4111-8111-111111111111";
const OWNER_B = "22222222-2222-4222-8222-222222222222";
const testStorePath = path.join(process.cwd(), "data", "local_sessions.test.json");

function sampleSession(owner = OWNER_A): GreenAgentSession {
  const now = new Date(0).toISOString();
  return {
    id: "00000000-0000-4000-8000-000000000000",
    anonymousUserId: owner,
    timestamp: now,
    tabs: 10,
    hours: 5,
    tasks: "Test storage ownership",
    focusScore: 80,
    carbonScore: 75,
    analysisSource: "fallback",
    agents: {
      contextAnalyzer: {
        summary: "Summary",
        focusRisks: ["Risk"],
        workPattern: "Focused",
        severity: "low",
      },
      carbonEstimator: {
        estimatedImpact: "low",
        carbonExplanation: "Explanation",
        mainCarbonDrivers: ["Driver"],
        sustainabilityRisk: "low",
      },
      optimizer: { focusScore: 80, carbonScore: 75, recommendations: [] },
      actionRecommender: {
        bestActionTitle: "Action",
        bestActionReason: "Reason",
        expectedOutcome: "Outcome",
      },
    },
    recommendations: [],
    bestAction: {
      bestActionTitle: "Action",
      bestActionReason: "Reason",
      expectedOutcome: "Outcome",
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function loadStore(firestore: unknown) {
  vi.doMock("./admin", () => ({
    getAdminFirestore: () => firestore,
  }));
  return import("./sessions");
}

beforeEach(async () => {
  vi.resetModules();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  await fs.rm(testStorePath, { force: true });
});

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await fs.rm(testStorePath, { force: true });
});

describe("sessionStore", () => {
  it("rejects local fallback in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { sessionStore } = await loadStore(null);

    await expect(sessionStore.saveSession(sampleSession())).rejects.toThrow(
      "Firestore configuration is required in production.",
    );
  });

  it("does not return a session to a different owner", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { sessionStore } = await loadStore(null);
    const session = sampleSession();
    await sessionStore.saveSession(session);

    await expect(sessionStore.getOwnedSession(session.id, OWNER_B)).resolves.toBeNull();
    await expect(sessionStore.getOwnedSession(session.id, OWNER_A)).resolves.toMatchObject({
      id: session.id,
    });
  });

  it("falls back to local development storage when configured Firestore is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const unavailableFirestore = {
      collection: () => ({
        doc: () => ({
          set: async () => {
            throw new Error("7 PERMISSION_DENIED: Cloud Firestore API is disabled");
          },
        }),
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: async () => {
                throw new Error("7 PERMISSION_DENIED: Cloud Firestore API is disabled");
              },
            }),
          }),
        }),
      }),
    };
    const { sessionStore } = await loadStore(unavailableFirestore);
    const session = sampleSession();

    await sessionStore.saveSession(session);

    await expect(sessionStore.getHistory(OWNER_A)).resolves.toMatchObject([
      { id: session.id },
    ]);
  });
});
