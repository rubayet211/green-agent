import { describe, expect, it } from "vitest";
import {
  AnalyzeRequestSchema,
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
});

describe("OptimizerAgentOutputSchema", () => {
  const recommendation = {
    title: "Close unused tabs",
    description: "Close tabs not needed for the next work block.",
    productivityBenefit: "Reduces context switching.",
    sustainabilityBenefit: "Reduces background activity.",
    difficulty: "easy",
    impact: "high",
  };

  it("rejects scores outside 0 to 100", () => {
    const result = OptimizerAgentOutputSchema.safeParse({
      focusScore: 101,
      carbonScore: -1,
      recommendations: [recommendation, recommendation, recommendation],
    });

    expect(result.success).toBe(false);
  });

  it("requires three or four recommendations", () => {
    const result = OptimizerAgentOutputSchema.safeParse({
      focusScore: 70,
      carbonScore: 80,
      recommendations: [recommendation, recommendation],
    });

    expect(result.success).toBe(false);
  });
});
