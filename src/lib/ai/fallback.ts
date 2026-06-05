import crypto from "node:crypto";
import {
  calculateFallbackScores,
  formatMoneyEstimate,
  roundMoney,
} from "@/lib/utils/score";
import type {
  ActionRecommenderOutput,
  CarbonCostEstimatorOutput,
  ContextAnalyzerOutput,
  Currency,
  EstimatedCarbonImpact,
  Recommendation,
} from "@/types/greenagent";
import type { AnalyzeRequest } from "@/lib/validations/greenagent";

export interface AnalysisResult {
  contextAnalyzer: ContextAnalyzerOutput;
  carbonCostEstimator: CarbonCostEstimatorOutput;
  focusScore: number;
  hiddenCostScore: number;
  estimatedRevenueLoss: number;
  estimatedTimeLostMinutes: number;
  estimatedElectricityCost: number;
  estimatedCarbonImpact: EstimatedCarbonImpact;
  currency: Currency;
  hourlyRate?: number;
  billablePercentage?: number;
  recommendations: Recommendation[];
  bestAction: ActionRecommenderOutput;
  source: "gemini" | "fallback";
  carbonScore?: number;
}

function recommendationId(index: number): string {
  return `rec-${index}-${crypto.randomBytes(4).toString("hex")}`;
}

function financialLabel(value: number, currency: Currency): string {
  return `${formatMoneyEstimate(value, currency)} potential earning protected`;
}

function benefitFromMinutes(minutes: number, hourlyRate: number): number {
  return roundMoney((minutes / 60) * hourlyRate);
}

export function createFallbackAnalysis(input: AnalyzeRequest): AnalysisResult {
  const { tabs, hours } = input;
  const scores = calculateFallbackScores(input);
  const hourlyRate = scores.effectiveHourlyRate;
  const currency = scores.currency;
  const tabCleanupMinutes = Math.max(15, Math.min(60, Math.round(tabs * 1.1)));
  const workBlockMinutes = Math.max(25, Math.min(75, Math.round(hours * 8)));
  const adminBatchMinutes = Math.max(15, Math.min(45, Math.round(tabs * 0.45 + 10)));

  const recommendations: Recommendation[] = [
    {
      id: recommendationId(0),
      title: "Close non-client tabs before the next focus block",
      description:
        "Keep only the tabs needed for the current paid outcome, then park the rest in a reading list or project folder.",
      productivityBenefit:
        "Reduces context switching while protecting the next billable work block.",
      sustainabilityBenefit:
        "Lowers browser memory pressure, background network requests, and avoidable digital waste.",
      estimatedTimeSavedMinutes: tabCleanupMinutes,
      estimatedFinancialBenefit: benefitFromMinutes(tabCleanupMinutes, hourlyRate),
      financialBenefitLabel: financialLabel(
        benefitFromMinutes(tabCleanupMinutes, hourlyRate),
        currency,
      ),
      difficulty: "easy",
      impact: tabs > 40 ? "high" : "medium",
    },
    {
      id: recommendationId(1),
      title: "Run one 60-minute client-output block",
      description:
        "Pick one deliverable, mute communication, and work until there is a visible client-facing artifact.",
      productivityBenefit:
        "Turns screen time into finished output instead of fragmented task progress.",
      sustainabilityBenefit:
        "Avoids repeated app switching, reloads, and idle background activity during focused work.",
      estimatedTimeSavedMinutes: workBlockMinutes,
      estimatedFinancialBenefit: benefitFromMinutes(workBlockMinutes, hourlyRate),
      financialBenefitLabel: financialLabel(
        benefitFromMinutes(workBlockMinutes, hourlyRate),
        currency,
      ),
      difficulty: "medium",
      impact: "high",
    },
    {
      id: recommendationId(2),
      title: "Batch admin and communication into one window",
      description:
        "Reserve a single response window for messages, invoices, and status updates instead of keeping them open all day.",
      productivityBenefit:
        "Protects proposal or client-production time from low-value interruptions.",
      sustainabilityBenefit:
        "Reduces idle tabs, notification polling, and repeated cloud sync activity.",
      estimatedTimeSavedMinutes: adminBatchMinutes,
      estimatedFinancialBenefit: benefitFromMinutes(adminBatchMinutes, hourlyRate),
      financialBenefitLabel: financialLabel(
        benefitFromMinutes(adminBatchMinutes, hourlyRate),
        currency,
      ),
      difficulty: "easy",
      impact: "medium",
    },
  ];

  return {
    contextAnalyzer: {
      summary: `This ${input.mode ?? "work"} session has ${tabs} open tabs and ${hours} screen hours, with ${scores.billablePercentage}% estimated billable time, creating a directional risk of ${scores.estimatedTimeLostMinutes} lost focus minutes.`,
      focusRisks:
        tabs > 25
          ? ["Tab overload during billable work", "Context switching between unrelated tasks"]
          : ["Moderate context switching risk"],
      workPattern: tabs > 30 ? "Fragmented freelancer workspace" : "Focused client workspace",
      severity: tabs > 60 || hours > 10 ? "high" : tabs > 25 || hours > 7 ? "medium" : "low",
      estimatedLostFocusMinutes: scores.estimatedTimeLostMinutes,
      earningRiskExplanation:
        "This is a behavioral estimate of attention leakage that could reduce effective earning time, not an exact income calculation.",
    },
    carbonCostEstimator: {
      estimatedImpact: scores.estimatedCarbonImpact.level,
      carbonExplanation: scores.estimatedCarbonImpact.explanation,
      mainCarbonDrivers: [
        "Background tab syncing",
        "Sustained display energy usage",
        "Repeated app and context switching",
      ],
      sustainabilityRisk: scores.estimatedCarbonImpact.level,
      estimatedRevenueLoss: scores.estimatedRevenueLoss,
      estimatedElectricityCost: scores.estimatedElectricityCost,
      hiddenCostExplanation:
        "Hidden cost combines rough opportunity cost, screen energy use, and avoidable browser background activity.",
    },
    focusScore: scores.focusScore,
    hiddenCostScore: scores.hiddenCostScore,
    estimatedRevenueLoss: scores.estimatedRevenueLoss,
    estimatedTimeLostMinutes: scores.estimatedTimeLostMinutes,
    estimatedElectricityCost: scores.estimatedElectricityCost,
    estimatedCarbonImpact: scores.estimatedCarbonImpact,
    currency,
    hourlyRate: input.hourlyRate,
    billablePercentage: input.billablePercentage,
    recommendations,
    bestAction: {
      bestActionTitle: recommendations[0].title,
      bestActionReason:
        "It is the fastest low-effort action for protecting earning focus and reducing idle browser waste.",
      expectedOutcome:
        "A cleaner client work block with less context switching and lower background activity.",
      financialImpact: recommendations[0].financialBenefitLabel,
      carbonImpact: recommendations[0].sustainabilityBenefit,
      milestoneLabel: "Sustainable Work Milestone",
    },
    source: "fallback",
    carbonScore: scores.hiddenCostScore,
  };
}
