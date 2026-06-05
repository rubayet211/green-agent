import type { GreenAgentSession, Recommendation } from "@/types/greenagent";

interface BuildMilestonePayloadInput {
  session: GreenAgentSession;
  recommendation: Recommendation;
  network: string;
  timestamp?: string;
}

export function buildSustainableWorkMilestonePayload({
  session,
  recommendation,
  network,
  timestamp = new Date().toISOString(),
}: BuildMilestonePayloadInput): Record<string, unknown> {
  return {
    app: "GreenAgent",
    type: "SUSTAINABLE_WORK_MILESTONE",
    timestamp,
    sessionId: session.id,
    focusScore: session.focusScore,
    hiddenCostScore: session.hiddenCostScore ?? session.carbonScore ?? 0,
    estimatedRevenueLoss: session.estimatedRevenueLoss ?? 0,
    estimatedTimeLostMinutes: session.estimatedTimeLostMinutes ?? 0,
    currency: session.currency ?? "USD",
    actionTitle: recommendation.title,
    actionDescription: recommendation.description,
    estimatedFinancialBenefit: recommendation.estimatedFinancialBenefit,
    estimatedTimeSavedMinutes: recommendation.estimatedTimeSavedMinutes,
    sustainabilityBenefit: recommendation.sustainabilityBenefit,
    network,
  };
}
