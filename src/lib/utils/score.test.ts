import { describe, expect, it } from "vitest";
import { calculateFallbackScores } from "./score";

const baseInput = {
  tabs: 20,
  hours: 6,
  tasks: "Finish a client dashboard and send a progress update.",
  hourlyRate: 60,
  currency: "USD" as const,
};

describe("calculateFallbackScores", () => {
  it("uses billable percentage to calibrate estimated revenue loss", () => {
    const fullyBillable = calculateFallbackScores({
      ...baseInput,
      billablePercentage: 100,
    });
    const halfBillable = calculateFallbackScores({
      ...baseInput,
      billablePercentage: 50,
    });

    expect(halfBillable.effectiveHourlyRate).toBe(30);
    expect(halfBillable.estimatedRevenueLoss).toBe(
      fullyBillable.estimatedRevenueLoss / 2,
    );
  });

  it("defaults to a conservative billable percentage when omitted", () => {
    const result = calculateFallbackScores(baseInput);

    expect(result.billablePercentage).toBe(70);
    expect(result.effectiveHourlyRate).toBe(42);
  });
});
