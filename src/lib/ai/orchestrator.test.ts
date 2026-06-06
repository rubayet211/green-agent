import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GEMINI_MODEL } from "./gemini";
import { runAnalysis } from "./orchestrator";

const input = {
  tabs: 20,
  hours: 6,
  tasks: "Finish GreenAgent hardening",
  mode: "Client Project" as const,
  hourlyRate: 20,
  billablePercentage: 80,
  currency: "USD" as const,
};

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runAnalysis", () => {
  it("uses the stable primary Gemini model for demo reliability", () => {
    expect(GEMINI_MODEL).toBe("gemini-2.5-flash");
  });

  it("returns deterministic fallback output when AI is disabled", async () => {
    const first = await runAnalysis(input, { aiEnabled: false });
    const second = await runAnalysis(input, { aiEnabled: false });
    const withoutIds = (result: typeof first) =>
      result.recommendations.map((recommendation) => ({
        title: recommendation.title,
        description: recommendation.description,
        productivityBenefit: recommendation.productivityBenefit,
        sustainabilityBenefit: recommendation.sustainabilityBenefit,
        estimatedTimeSavedMinutes: recommendation.estimatedTimeSavedMinutes,
        estimatedFinancialBenefit: recommendation.estimatedFinancialBenefit,
        financialBenefitLabel: recommendation.financialBenefitLabel,
        difficulty: recommendation.difficulty,
        impact: recommendation.impact,
      }));

    expect(first.focusScore).toBe(second.focusScore);
    expect(first.hiddenCostScore).toBe(second.hiddenCostScore);
    expect(first.estimatedRevenueLoss).toBeGreaterThanOrEqual(0);
    expect(first.estimatedTimeLostMinutes).toBeGreaterThanOrEqual(0);
    expect(first.recommendations[0].estimatedFinancialBenefit).toBeGreaterThanOrEqual(0);
    expect(withoutIds(first)).toEqual(withoutIds(second));
    expect(first.source).toBe("fallback");
  });

  it("keeps the best action bound to a validated recommendation", async () => {
    const invoke = vi
      .fn()
      .mockResolvedValueOnce({
        summary: "Focused session",
        focusRisks: ["Many tabs"],
        workPattern: "Deep work",
        severity: "medium",
        estimatedLostFocusMinutes: 45,
        earningRiskExplanation: "Potential billable focus leakage.",
      })
      .mockResolvedValueOnce({
        estimatedImpact: "medium",
        carbonExplanation: "Some avoidable activity",
        mainCarbonDrivers: ["Many tabs"],
        sustainabilityRisk: "medium",
        estimatedRevenueLoss: 15,
        estimatedElectricityCost: 0.12,
        hiddenCostExplanation: "Directional hidden cost estimate.",
      })
      .mockResolvedValueOnce({
        focusScore: 70,
        hiddenCostScore: 65,
        recommendations: [
          {
            title: "Close unused tabs",
            description: "Close tabs outside the current task.",
            productivityBenefit: "Less distraction.",
            sustainabilityBenefit: "Less background activity.",
            estimatedTimeSavedMinutes: 30,
            estimatedFinancialBenefit: 10,
            financialBenefitLabel: "$10.00 potential earning protected",
            difficulty: "easy",
            impact: "high",
          },
          {
            title: "Use one work block",
            description: "Finish one task before switching.",
            productivityBenefit: "More focus.",
            sustainabilityBenefit: "Less repeated loading.",
            estimatedTimeSavedMinutes: 25,
            estimatedFinancialBenefit: 8.33,
            financialBenefitLabel: "$8.33 potential earning protected",
            difficulty: "easy",
            impact: "medium",
          },
          {
            title: "Take a screen break",
            description: "Step away after the work block.",
            productivityBenefit: "Recover attention.",
            sustainabilityBenefit: "Reduce screen time.",
            estimatedTimeSavedMinutes: 20,
            estimatedFinancialBenefit: 6.67,
            financialBenefitLabel: "$6.67 potential earning protected",
            difficulty: "easy",
            impact: "medium",
          },
        ],
      })
      .mockResolvedValueOnce({
        bestActionTitle: "Invented action",
        bestActionReason: "Hallucinated choice",
        expectedOutcome: "Unknown",
        financialImpact: "Unknown",
        carbonImpact: "Unknown",
        milestoneLabel: "Sustainable Work Milestone",
      });

    const result = await runAnalysis(input, { aiEnabled: true, invoke });

    expect(result.bestAction.bestActionTitle).toBe(result.recommendations[0].title);
  });

  it("uses fallback without error logging for expected Gemini deadline errors", async () => {
    const deadlineError = Object.assign(
      new Error('{"error":{"status":"DEADLINE_EXCEEDED"}}'),
      { status: 504 },
    );

    const result = await runAnalysis(input, {
      aiEnabled: true,
      invoke: vi.fn().mockRejectedValue(deadlineError),
    });

    expect(result.source).toBe("fallback");
    expect(console.warn).toHaveBeenCalledWith(
      "Gemini unavailable; using validated fallback (status 504: Gemini deadline exceeded).",
    );
    expect(console.error).not.toHaveBeenCalled();
  });
});
