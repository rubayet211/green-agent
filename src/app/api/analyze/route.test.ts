import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalysisResult } from "@/lib/ai/fallback";
import type { GreenAgentSession } from "@/types/greenagent";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";

const analysis: AnalysisResult = {
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
    hiddenCostExplanation: "Estimated hidden cost from focus and digital waste.",
  },
  focusScore: 74,
  hiddenCostScore: 69,
  estimatedRevenueLoss: 12,
  estimatedTimeLostMinutes: 30,
  estimatedElectricityCost: 0.1,
  estimatedCarbonImpact: {
    level: "medium",
    explanation: "Directional background activity estimate.",
  },
  currency: "USD",
  recommendations: [
    {
      id: "rec-1",
      title: "Close non-client tabs",
      description: "Keep only tabs needed for the client deliverable.",
      productivityBenefit: "Less context switching.",
      sustainabilityBenefit: "Lower background browser activity.",
      estimatedTimeSavedMinutes: 30,
      estimatedFinancialBenefit: 12,
      financialBenefitLabel: "$12.00 potential earning protected",
      difficulty: "easy",
      impact: "high",
    },
    {
      id: "rec-2",
      title: "Run one client-output block",
      description: "Finish one deliverable before switching.",
      productivityBenefit: "More finished output.",
      sustainabilityBenefit: "Less repeated app loading.",
      estimatedTimeSavedMinutes: 25,
      estimatedFinancialBenefit: 10,
      financialBenefitLabel: "$10.00 potential earning protected",
      difficulty: "medium",
      impact: "medium",
    },
    {
      id: "rec-3",
      title: "Batch admin replies",
      description: "Answer messages in one window.",
      productivityBenefit: "Fewer interruptions.",
      sustainabilityBenefit: "Less notification polling.",
      estimatedTimeSavedMinutes: 20,
      estimatedFinancialBenefit: 8,
      financialBenefitLabel: "$8.00 potential earning protected",
      difficulty: "easy",
      impact: "medium",
    },
  ],
  bestAction: {
    bestActionTitle: "Close non-client tabs",
    bestActionReason: "Best low-effort combined impact.",
    expectedOutcome: "Cleaner paid work block.",
    financialImpact: "$12.00 potential earning protected",
    carbonImpact: "Lower background browser activity.",
    milestoneLabel: "Sustainable Work Milestone",
  },
  source: "fallback",
  carbonScore: 69,
};

async function loadAnalyzeRoute(identity: string | null = OWNER_ID) {
  vi.resetModules();
  const saveSession = vi.fn(async () => undefined);
  vi.doMock("@/lib/security/identity", () => ({
    getRequestIdentity: () => identity,
  }));
  vi.doMock("@/lib/security/rate-limit", () => ({
    apiRateLimiter: {
      consume: () => ({ allowed: true, remaining: 4, retryAfterSeconds: 60 }),
    },
  }));
  vi.doMock("@/lib/ai/orchestrator", () => ({
    runAnalysis: vi.fn().mockResolvedValue(analysis),
  }));
  vi.doMock("@/lib/firebase/sessions", () => ({
    sessionStore: { saveSession },
  }));
  const route = await import("./route");
  return { POST: route.POST, saveSession };
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("POST /api/analyze", () => {
  it("returns the persisted session plus a nested sanitized input contract", async () => {
    const { POST, saveSession } = await loadAnalyzeRoute();

    const response = await POST(
      jsonRequest({
        tabs: 18,
        hours: 6,
        tasks: "Ship a client dashboard",
        mode: "Client Project",
        hourlyRate: 30,
        currency: "USD",
        anonymousUserId: "spoofed",
      }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as GreenAgentSession & {
      input?: Record<string, unknown>;
    };
    expect(body).toMatchObject({
      anonymousUserId: OWNER_ID,
      focusScore: 74,
      hiddenCostScore: 69,
      estimatedRevenueLoss: 12,
      estimatedTimeLostMinutes: 30,
      input: {
        tabs: 18,
        hours: 6,
        tasks: "Ship a client dashboard",
        mode: "Client Project",
        hourlyRate: 30,
        currency: "USD",
      },
    });
    expect(body.input).not.toHaveProperty("anonymousUserId");
    expect(saveSession).toHaveBeenCalledOnce();
  });

  it("requires anonymous identity before analysis", async () => {
    const { POST } = await loadAnalyzeRoute(null);

    const response = await POST(
      jsonRequest({
        tabs: 18,
        hours: 6,
        tasks: "Ship a client dashboard",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "IDENTITY_REQUIRED",
    });
  });

  it("rejects invalid request bodies", async () => {
    const { POST } = await loadAnalyzeRoute();

    const response = await POST(
      jsonRequest({
        tabs: 301,
        hours: 6,
        tasks: "Ship a client dashboard",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_REQUEST",
    });
  });
});
