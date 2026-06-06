import { afterEach, describe, expect, it, vi } from "vitest";
import type { GreenAgentSession } from "@/types/greenagent";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "00000000-0000-4000-8000-000000000000";

function sampleSession(): GreenAgentSession {
  const now = new Date(0).toISOString();
  const recommendation = {
    id: "rec-1",
    title: "Close non-client tabs",
    description: "Keep only tabs needed for the current client deliverable.",
    productivityBenefit: "Less context switching.",
    sustainabilityBenefit: "Lower background browser activity.",
    estimatedTimeSavedMinutes: 30,
    estimatedFinancialBenefit: 12,
    financialBenefitLabel: "$12.00 potential earning protected",
    difficulty: "easy" as const,
    impact: "high" as const,
  };

  return {
    id: SESSION_ID,
    anonymousUserId: OWNER_ID,
    timestamp: now,
    tabs: 18,
    hours: 6,
    tasks: "Ship a client dashboard",
    mode: "Client Project",
    currency: "USD",
    focusScore: 74,
    hiddenCostScore: 69,
    carbonScore: 69,
    estimatedRevenueLoss: 12,
    estimatedTimeLostMinutes: 30,
    estimatedElectricityCost: 0.1,
    estimatedCarbonImpact: {
      level: "medium",
      explanation: "Directional estimate.",
    },
    analysisSource: "fallback",
    agents: {
      contextAnalyzer: {
        summary: "Focused client work session.",
        focusRisks: ["Tab overload"],
        workPattern: "Client delivery",
        severity: "medium",
        estimatedLostFocusMinutes: 30,
        earningRiskExplanation: "Potential billable focus leakage.",
      },
      carbonCostEstimator: {
        estimatedImpact: "medium",
        carbonExplanation: "Directional background activity estimate.",
        mainCarbonDrivers: ["Background tabs"],
        sustainabilityRisk: "medium",
        estimatedRevenueLoss: 12,
        estimatedElectricityCost: 0.1,
        hiddenCostExplanation: "Estimated hidden cost.",
      },
      optimizer: {
        focusScore: 74,
        hiddenCostScore: 69,
        carbonScore: 69,
        recommendations: [recommendation],
      },
      actionRecommender: {
        bestActionTitle: recommendation.title,
        bestActionReason: "Best combined impact.",
        expectedOutcome: "Cleaner paid work block.",
        financialImpact: recommendation.financialBenefitLabel,
        carbonImpact: recommendation.sustainabilityBenefit,
        milestoneLabel: "Sustainable Work Milestone",
      },
    },
    recommendations: [recommendation],
    bestAction: {
      bestActionTitle: recommendation.title,
      bestActionReason: "Best combined impact.",
      expectedOutcome: "Cleaner paid work block.",
      financialImpact: recommendation.financialBenefitLabel,
      carbonImpact: recommendation.sustainabilityBenefit,
      milestoneLabel: "Sustainable Work Milestone",
    },
    createdAt: now,
    updatedAt: now,
  };
}

async function loadHederaRoute(session: GreenAgentSession | null = sampleSession()) {
  vi.resetModules();
  const saveSession = vi.fn(async () => undefined);
  vi.doMock("@/lib/security/identity", () => ({
    getRequestIdentity: () => OWNER_ID,
  }));
  vi.doMock("@/lib/security/rate-limit", () => ({
    apiRateLimiter: {
      consume: () => ({ allowed: true, remaining: 4, retryAfterSeconds: 60 }),
    },
  }));
  vi.doMock("@/lib/firebase/sessions", () => ({
    sessionStore: {
      getOwnedSession: vi.fn().mockResolvedValue(session),
      saveSession,
    },
  }));
  vi.doMock("@/lib/hedera/client", () => ({
    isHederaSignatureError: () => false,
    submitToTopic: vi.fn().mockResolvedValue({
      status: "simulated",
      network: "testnet",
      reason: "Hedera credentials or topic ID are not configured.",
    }),
  }));
  const route = await import("./route");
  return { POST: route.POST, saveSession };
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/hedera/log-action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("POST /api/hedera/log-action", () => {
  it("persists the selected Sustainable Work Milestone after simulated logging", async () => {
    const { POST, saveSession } = await loadHederaRoute();

    const response = await POST(
      jsonRequest({ sessionId: SESSION_ID, actionId: "rec-1" }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as GreenAgentSession;
    expect(body.selectedAction).toMatchObject({ id: "rec-1" });
    expect(body.hedera).toMatchObject({
      status: "simulated",
      actionType: "SUSTAINABLE_WORK_MILESTONE",
    });
    expect(saveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedAction: expect.objectContaining({ id: "rec-1" }),
        hedera: expect.objectContaining({
          actionType: "SUSTAINABLE_WORK_MILESTONE",
        }),
      }),
    );
  });

  it("rejects recommendation IDs that do not belong to the session", async () => {
    const { POST } = await loadHederaRoute();

    const response = await POST(
      jsonRequest({ sessionId: SESSION_ID, actionId: "rec-missing" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      code: "RECOMMENDATION_NOT_FOUND",
    });
  });
});
