import { describe, expect, it } from "vitest";
import { buildSustainableWorkMilestonePayload } from "./milestone-payload";
import type { GreenAgentSession } from "@/types/greenagent";

function sampleSession(): GreenAgentSession {
  const now = new Date(0).toISOString();
  return {
    id: "00000000-0000-4000-8000-000000000000",
    anonymousUserId: "11111111-1111-4111-8111-111111111111",
    timestamp: now,
    tabs: 20,
    hours: 6,
    tasks: "Finish client dashboard",
    mode: "Client Project",
    hourlyRate: 20,
    billablePercentage: 80,
    currency: "USD",
    focusScore: 72,
    hiddenCostScore: 68,
    estimatedRevenueLoss: 18.5,
    estimatedTimeLostMinutes: 56,
    estimatedElectricityCost: 0.12,
    estimatedCarbonImpact: {
      level: "medium",
      explanation: "Directional background activity estimate.",
    },
    analysisSource: "fallback",
    agents: {
      contextAnalyzer: {
        summary: "Summary",
        focusRisks: ["Risk"],
        workPattern: "Focused",
        severity: "medium",
        estimatedLostFocusMinutes: 56,
        earningRiskExplanation: "Some focus leakage.",
      },
      carbonCostEstimator: {
        estimatedImpact: "medium",
        carbonExplanation: "Explanation",
        mainCarbonDrivers: ["Driver"],
        sustainabilityRisk: "medium",
        estimatedRevenueLoss: 18.5,
        estimatedElectricityCost: 0.12,
        hiddenCostExplanation: "Hidden cost explanation.",
      },
      optimizer: {
        focusScore: 72,
        hiddenCostScore: 68,
        recommendations: [],
      },
      actionRecommender: {
        bestActionTitle: "Close non-client tabs",
        bestActionReason: "Best combined impact.",
        expectedOutcome: "Recover focus.",
        financialImpact: "$10.00 potential earning protected",
        carbonImpact: "Lower idle browser activity.",
        milestoneLabel: "Sustainable Work Milestone",
      },
    },
    recommendations: [],
    bestAction: {
      bestActionTitle: "Close non-client tabs",
      bestActionReason: "Best combined impact.",
      expectedOutcome: "Recover focus.",
      financialImpact: "$10.00 potential earning protected",
      carbonImpact: "Lower idle browser activity.",
      milestoneLabel: "Sustainable Work Milestone",
    },
    createdAt: now,
    updatedAt: now,
  };
}

describe("buildSustainableWorkMilestonePayload", () => {
  it("uses the Sustainable Work Milestone payload without fake transaction fields", () => {
    const action = {
      id: "rec-1",
      title: "Close non-client tabs",
      description: "Reduce context switching before the next client work block.",
      productivityBenefit: "Protects billable focus.",
      sustainabilityBenefit: "Reduces browser memory and background network activity.",
      estimatedTimeSavedMinutes: 30,
      estimatedFinancialBenefit: 10,
      financialBenefitLabel: "$10.00 potential earning protected",
      difficulty: "easy" as const,
      impact: "high" as const,
    };

    const payload = buildSustainableWorkMilestonePayload({
      session: sampleSession(),
      recommendation: action,
      network: "hedera-testnet",
      timestamp: "2026-06-06T00:00:00.000Z",
    });

    expect(payload).toMatchObject({
      app: "GreenAgent",
      type: "SUSTAINABLE_WORK_MILESTONE",
      sessionId: "00000000-0000-4000-8000-000000000000",
      focusScore: 72,
      hiddenCostScore: 68,
      estimatedRevenueLoss: 18.5,
      estimatedTimeLostMinutes: 56,
      currency: "USD",
      actionTitle: action.title,
      estimatedFinancialBenefit: 10,
      estimatedTimeSavedMinutes: 30,
      sustainabilityBenefit: action.sustainabilityBenefit,
      network: "hedera-testnet",
    });
    expect(payload).not.toHaveProperty("transactionId");
    expect(payload).not.toHaveProperty("consensusTimestamp");
  });
});
