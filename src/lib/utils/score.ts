import type { Currency, SeverityLevel } from "@/types/greenagent";

export const DEFAULT_HOURLY_RATE = 15;
export const DEFAULT_BILLABLE_PERCENTAGE = 70;

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  BDT: "৳",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoneyEstimate(value: number, currency: Currency): string {
  const amount = roundMoney(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbols[currency]}${amount}`;
}

export function calculateFallbackScores(input: {
  tabs: number;
  hours: number;
  tasks: string;
  hourlyRate?: number;
  billablePercentage?: number;
  currency?: Currency;
}) {
  const currency = input.currency ?? "USD";
  const baseHourlyRate =
    input.hourlyRate !== undefined && input.hourlyRate > 0
      ? input.hourlyRate
      : DEFAULT_HOURLY_RATE;
  const billablePercentage = clamp(
    input.billablePercentage ?? DEFAULT_BILLABLE_PERCENTAGE,
    0,
    100,
  );
  const effectiveHourlyRate = roundMoney(baseHourlyRate * (billablePercentage / 100));
  const tabPenalty = Math.min(input.tabs * 0.8, 35);
  const hourPenalty = Math.min(Math.max(input.hours - 4, 0) * 5, 35);
  const taskClarityBonus = input.tasks.trim().length > 40 ? 10 : 0;
  const focusScore = clamp(
    Math.round(85 - tabPenalty - hourPenalty + taskClarityBonus),
    0,
    100,
  );
  const estimatedTimeLostMinutes = Math.round(
    clamp(
      Math.min(
        input.tabs * 1.5 + Math.max(input.hours - 4, 0) * 12,
        input.hours * 60 * 0.45,
      ),
      0,
      24 * 60,
    ),
  );
  const estimatedRevenueLoss = roundMoney(
    (estimatedTimeLostMinutes / 60) * effectiveHourlyRate,
  );
  const digitalWastePenalty =
    Math.min(input.tabs * 0.5, 25) + Math.min(input.hours * 2.5, 40);
  const hiddenCostScore = clamp(
    Math.round(90 - digitalWastePenalty - estimatedTimeLostMinutes / 8),
    0,
    100,
  );
  const estimatedElectricityCost = roundMoney(
    clamp(input.hours * 0.018 + input.tabs * 0.0012, 0, 25),
  );
  const estimatedCarbonLevel: SeverityLevel =
    input.hours > 10 || input.tabs > 80
      ? "high"
      : input.hours > 6 || input.tabs > 25
        ? "medium"
        : "low";

  return {
    focusScore,
    hiddenCostScore,
    estimatedRevenueLoss,
    estimatedTimeLostMinutes,
    estimatedElectricityCost,
    estimatedCarbonImpact: {
      level: estimatedCarbonLevel,
      explanation:
        "Directional estimate based on screen time, tab count, browser background work, and idle network activity.",
    },
    effectiveHourlyRate,
    billablePercentage,
    currency,
    carbonScore: hiddenCostScore,
  };
}
