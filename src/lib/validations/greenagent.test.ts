import { describe, expect, it } from "vitest";
import {
  AnalyzeRequestSchema,
  GreenAgentSessionSchema,
  OptimizerAgentOutputSchema,
} from "./greenagent";

describe("AnalyzeRequestSchema", () => {
  it("rejects oversized task prompts", () => {
    const result = AnalyzeRequestSchema.safeParse({
      tabs: 10,
      hours: 5,
      tasks: "x".repeat(1_001),
      mode: "Deep Work",
    });

    expect(result.success).toBe(false);
  });

  it("does not accept a client-provided anonymous user id", () => {
    const result = AnalyzeRequestSchema.parse({
      tabs: 10,
      hours: 5,
      tasks: "Ship the MVP",
      anonymousUserId: "spoofed",
    });

    expect(result).not.toHaveProperty("anonymousUserId");
  });

  it("accepts optional freelancer earning fields with USD as the default currency", () => {
    const result = AnalyzeRequestSchema.parse({
      tabs: 10,
      hours: 5,
      tasks: "Ship a client landing page",
      mode: "Client Project",
      hourlyRate: 25,
      billablePercentage: 80,
    });

    expect(result).toMatchObject({
      hourlyRate: 25,
      billablePercentage: 80,
      currency: "USD",
    });
  });

  it("rejects unreasonable hourly rates", () => {
    const result = AnalyzeRequestSchema.safeParse({
      tabs: 10,
      hours: 5,
      tasks: "Ship a client landing page",
      mode: "Client Project",
      hourlyRate: 10_000,
      currency: "USD",
    });

    expect(result.success).toBe(false);
  });

  it("rejects billable percentages outside 0 to 100", () => {
    const result = AnalyzeRequestSchema.safeParse({
      tabs: 10,
      hours: 5,
      tasks: "Ship a client landing page",
      mode: "Client Project",
      hourlyRate: 50,
      billablePercentage: 125,
      currency: "USD",
    });

    expect(result.success).toBe(false);
  });
});

describe("OptimizerAgentOutputSchema", () => {
  const recommendation = {
    title: "Close unused tabs",
    description: "Close tabs not needed for the next work block.",
    productivityBenefit: "Reduces context switching.",
    sustainabilityBenefit: "Reduces background activity.",
    estimatedTimeSavedMinutes: 30,
    estimatedFinancialBenefit: 12.5,
    financialBenefitLabel: "$12.50 potential earning protected",
    difficulty: "easy",
    impact: "high",
  };

  it("rejects scores outside 0 to 100", () => {
    const result = OptimizerAgentOutputSchema.safeParse({
      focusScore: 101,
      hiddenCostScore: -1,
      recommendations: [recommendation, recommendation, recommendation],
    });

    expect(result.success).toBe(false);
  });

  it("requires three or four recommendations", () => {
    const result = OptimizerAgentOutputSchema.safeParse({
      focusScore: 70,
      hiddenCostScore: 80,
      recommendations: [recommendation, recommendation],
    });

    expect(result.success).toBe(false);
  });
});

describe("GreenAgentSessionSchema", () => {
  it("maps legacy carbonScore sessions to hiddenCostScore", () => {
    const now = new Date(0).toISOString();
    const parsed = GreenAgentSessionSchema.parse({
      id: "00000000-0000-4000-8000-000000000000",
      anonymousUserId: "11111111-1111-4111-8111-111111111111",
      timestamp: now,
      tabs: 10,
      hours: 5,
      tasks: "Legacy stored session",
      mode: "Deep Work",
      focusScore: 80,
      carbonScore: 72,
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
        optimizer: { focusScore: 80, carbonScore: 72, recommendations: [] },
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
    });

    expect(parsed.hiddenCostScore).toBe(72);
    expect(parsed.currency).toBe("USD");
  });
});
