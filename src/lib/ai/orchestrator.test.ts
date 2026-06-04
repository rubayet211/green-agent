import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GEMINI_MODEL } from "./gemini";
import { runAnalysis } from "./orchestrator";

const input = {
  tabs: 20,
  hours: 6,
  tasks: "Finish GreenAgent hardening",
  mode: "Deep Work" as const,
};

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runAnalysis", () => {
  it("uses the required Gemini model", () => {
    expect(GEMINI_MODEL).toBe("gemini-3-flash-preview");
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
        difficulty: recommendation.difficulty,
        impact: recommendation.impact,
      }));

    expect(first.focusScore).toBe(second.focusScore);
    expect(first.carbonScore).toBe(second.carbonScore);
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
      })
      .mockResolvedValueOnce({
        estimatedImpact: "medium",
        carbonExplanation: "Some avoidable activity",
        mainCarbonDrivers: ["Many tabs"],
        sustainabilityRisk: "medium",
      })
      .mockResolvedValueOnce({
        focusScore: 70,
        carbonScore: 65,
        recommendations: [
          {
            title: "Close unused tabs",
            description: "Close tabs outside the current task.",
            productivityBenefit: "Less distraction.",
            sustainabilityBenefit: "Less background activity.",
            difficulty: "easy",
            impact: "high",
          },
          {
            title: "Use one work block",
            description: "Finish one task before switching.",
            productivityBenefit: "More focus.",
            sustainabilityBenefit: "Less repeated loading.",
            difficulty: "easy",
            impact: "medium",
          },
          {
            title: "Take a screen break",
            description: "Step away after the work block.",
            productivityBenefit: "Recover attention.",
            sustainabilityBenefit: "Reduce screen time.",
            difficulty: "easy",
            impact: "medium",
          },
        ],
      })
      .mockResolvedValueOnce({
        bestActionTitle: "Invented action",
        bestActionReason: "Hallucinated choice",
        expectedOutcome: "Unknown",
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
