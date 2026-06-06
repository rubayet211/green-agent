import { describe, expect, it } from "vitest";
import { countSustainableWorkMilestones } from "./milestones";
import type { GreenAgentSession, Recommendation } from "@/types/greenagent";

const action: Recommendation = {
  id: "rec-1",
  title: "Close non-client tabs",
  description: "Close unrelated tabs.",
  productivityBenefit: "Protects focus.",
  sustainabilityBenefit: "Reduces background activity.",
  estimatedTimeSavedMinutes: 20,
  estimatedFinancialBenefit: 10,
  financialBenefitLabel: "$10.00 potential earning protected",
  difficulty: "easy",
  impact: "medium",
};

function session(
  overrides: Partial<GreenAgentSession>,
): GreenAgentSession {
  const now = new Date(0).toISOString();
  return {
    id: crypto.randomUUID(),
    anonymousUserId: "11111111-1111-4111-8111-111111111111",
    timestamp: now,
    tabs: 10,
    hours: 5,
    tasks: "Test",
    mode: "Client Project",
    currency: "USD",
    focusScore: 80,
    hiddenCostScore: 70,
    estimatedRevenueLoss: 10,
    estimatedTimeLostMinutes: 20,
    agents: {
      contextAnalyzer: {
        summary: "Summary",
        focusRisks: ["Risk"],
        workPattern: "Focused",
        severity: "low",
        estimatedLostFocusMinutes: 20,
        earningRiskExplanation: "Estimate.",
      },
      carbonCostEstimator: {
        estimatedImpact: "low",
        carbonExplanation: "Explanation",
        mainCarbonDrivers: ["Driver"],
        sustainabilityRisk: "low",
        estimatedRevenueLoss: 10,
        estimatedElectricityCost: 0.1,
        hiddenCostExplanation: "Hidden cost.",
      },
      optimizer: {
        focusScore: 80,
        hiddenCostScore: 70,
        recommendations: [action],
      },
      actionRecommender: {
        bestActionTitle: action.title,
        bestActionReason: "Reason",
        expectedOutcome: "Outcome",
        financialImpact: "$10.00 potential earning protected",
        carbonImpact: "Lower background activity.",
        milestoneLabel: "Sustainable Work Milestone",
      },
    },
    recommendations: [action],
    bestAction: {
      bestActionTitle: action.title,
      bestActionReason: "Reason",
      expectedOutcome: "Outcome",
      financialImpact: "$10.00 potential earning protected",
      carbonImpact: "Lower background activity.",
      milestoneLabel: "Sustainable Work Milestone",
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("countSustainableWorkMilestones", () => {
  it("counts only explicit Sustainable Work Milestones with a selected action", () => {
    const sessions = [
      session({
        selectedAction: action,
        hedera: {
          status: "success",
          actionType: "SUSTAINABLE_WORK_MILESTONE",
        },
      }),
      session({
        hedera: {
          status: "success",
        },
      }),
      session({
        selectedAction: action,
        hedera: {
          status: "simulated",
        },
      }),
    ];

    expect(countSustainableWorkMilestones(sessions)).toBe(1);
  });
});
