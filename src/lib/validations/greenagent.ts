import { z } from "zod";

const ShortTextSchema = z.string().trim().min(1).max(500);
const RiskListSchema = z.array(ShortTextSchema).min(1).max(5);
const ScoreSchema = z.number().finite().min(0).max(100);
const MinuteEstimateSchema = z.number().finite().min(0).max(24 * 60);
const MoneyEstimateSchema = z.number().finite().min(0).max(100_000);
const CurrencySchema = z.enum(["USD", "BDT", "INR", "EUR", "GBP"]);
const WorkModeSchema = z.enum([
  "Client Project",
  "Proposal Writing",
  "Research",
  "Content Creation",
  "Deep Work",
  "Admin / Communication",
  "Meetings",
  "Creative Work",
  "Study",
]);
const LevelSchema = z.enum(["low", "medium", "high"]);

export const AnalyzeRequestSchema = z.object({
  tabs: z.number().int().min(0).max(300),
  hours: z.number().finite().min(0).max(24),
  tasks: z.string().trim().min(1, "Tasks list cannot be empty").max(1_000),
  mode: WorkModeSchema.optional(),
  hourlyRate: z.number().finite().min(0).max(1_000).optional(),
  billablePercentage: z.number().finite().min(0).max(100).optional(),
  currency: CurrencySchema.default("USD"),
});

export const HederaLogRequestSchema = z.object({
  sessionId: z.string().uuid(),
  actionId: z.string().min(1).max(100),
});

export const ContextAnalyzerOutputSchema = z.object({
  summary: ShortTextSchema,
  focusRisks: RiskListSchema,
  workPattern: ShortTextSchema,
  severity: LevelSchema,
  estimatedLostFocusMinutes: MinuteEstimateSchema,
  earningRiskExplanation: ShortTextSchema,
});

const ContextAnalyzerStorageSchema = ContextAnalyzerOutputSchema.extend({
  estimatedLostFocusMinutes: MinuteEstimateSchema.optional(),
  earningRiskExplanation: ShortTextSchema.optional(),
}).transform((value) => ({
  ...value,
  estimatedLostFocusMinutes: value.estimatedLostFocusMinutes ?? 0,
  earningRiskExplanation:
    value.earningRiskExplanation ??
    "Legacy session stored before earning risk estimates were added.",
}));

export const CarbonCostEstimatorOutputSchema = z.object({
  estimatedImpact: LevelSchema,
  carbonExplanation: ShortTextSchema,
  mainCarbonDrivers: RiskListSchema,
  sustainabilityRisk: LevelSchema,
  estimatedRevenueLoss: MoneyEstimateSchema,
  estimatedElectricityCost: MoneyEstimateSchema,
  hiddenCostExplanation: ShortTextSchema,
});

export const CarbonEstimatorOutputSchema = CarbonCostEstimatorOutputSchema;

const CarbonCostEstimatorStorageSchema = CarbonCostEstimatorOutputSchema.extend({
  estimatedRevenueLoss: MoneyEstimateSchema.optional(),
  estimatedElectricityCost: MoneyEstimateSchema.optional(),
  hiddenCostExplanation: ShortTextSchema.optional(),
}).transform((value) => ({
  ...value,
  estimatedRevenueLoss: value.estimatedRevenueLoss ?? 0,
  estimatedElectricityCost: value.estimatedElectricityCost ?? 0,
  hiddenCostExplanation:
    value.hiddenCostExplanation ??
    "Legacy session stored before hidden cost estimates were added.",
}));

export const RecommendationAgentOutputSchema = z.object({
  title: ShortTextSchema,
  description: ShortTextSchema,
  productivityBenefit: ShortTextSchema,
  sustainabilityBenefit: ShortTextSchema,
  estimatedTimeSavedMinutes: MinuteEstimateSchema,
  estimatedFinancialBenefit: MoneyEstimateSchema,
  financialBenefitLabel: ShortTextSchema,
  difficulty: z.enum(["easy", "medium", "hard"]),
  impact: LevelSchema,
});

export const RecommendationSchema = RecommendationAgentOutputSchema.extend({
  id: z.string().min(1).max(100),
});

export const OptimizerAgentOutputSchema = z.object({
  focusScore: ScoreSchema,
  hiddenCostScore: ScoreSchema,
  recommendations: z.array(RecommendationAgentOutputSchema).min(3).max(4),
});

const OptimizerStorageSchema = z
  .object({
    focusScore: ScoreSchema,
    hiddenCostScore: ScoreSchema.optional(),
    carbonScore: ScoreSchema.optional(),
    recommendations: z.array(RecommendationSchema).max(4),
  })
  .transform((value) => ({
    focusScore: value.focusScore,
    hiddenCostScore: value.hiddenCostScore ?? value.carbonScore ?? 0,
    carbonScore: value.carbonScore,
    recommendations: value.recommendations,
  }));

export const ActionRecommenderOutputSchema = z.object({
  bestActionTitle: ShortTextSchema,
  bestActionReason: ShortTextSchema,
  expectedOutcome: ShortTextSchema,
  financialImpact: ShortTextSchema,
  carbonImpact: ShortTextSchema,
  milestoneLabel: z.literal("Sustainable Work Milestone"),
});

const ActionRecommenderStorageSchema = ActionRecommenderOutputSchema.extend({
  financialImpact: ShortTextSchema.optional(),
  carbonImpact: ShortTextSchema.optional(),
  milestoneLabel: z.literal("Sustainable Work Milestone").optional(),
}).transform((value) => ({
  ...value,
  financialImpact:
    value.financialImpact ??
    "Legacy session stored before financial impact estimates were added.",
  carbonImpact:
    value.carbonImpact ??
    "Legacy session stored before carbon impact wording was added.",
  milestoneLabel: value.milestoneLabel ?? "Sustainable Work Milestone",
}));

const EstimatedCarbonImpactSchema = z.object({
  level: LevelSchema,
  explanation: ShortTextSchema,
});

const HederaMetadataSchema = z.object({
  topicId: z.string().optional(),
  transactionId: z.string().optional(),
  consensusTimestamp: z.string().optional(),
  receiptStatus: z.string().optional(),
  network: z.enum(["testnet", "previewnet", "mainnet"]).optional(),
  status: z.enum(["pending", "success", "failed", "simulated"]),
  actionType: z.literal("SUSTAINABLE_WORK_MILESTONE").optional(),
  message: z.string().optional(),
});

const RawGreenAgentSessionSchema = z.object({
  id: z.string().uuid(),
  anonymousUserId: z.string().uuid(),
  timestamp: z.string().datetime(),
  tabs: z.number().int().min(0).max(300),
  hours: z.number().finite().min(0).max(24),
  tasks: z.string().min(1).max(1_000),
  mode: WorkModeSchema.optional(),
  hourlyRate: z.number().finite().min(0).max(1_000).optional(),
  billablePercentage: z.number().finite().min(0).max(100).optional(),
  currency: CurrencySchema.optional(),
  focusScore: ScoreSchema,
  hiddenCostScore: ScoreSchema.optional(),
  carbonScore: ScoreSchema.optional(),
  estimatedRevenueLoss: MoneyEstimateSchema.optional(),
  estimatedTimeLostMinutes: MinuteEstimateSchema.optional(),
  estimatedElectricityCost: MoneyEstimateSchema.optional(),
  estimatedCarbonImpact: EstimatedCarbonImpactSchema.optional(),
  analysisSource: z.enum(["gemini", "fallback"]).optional(),
  agents: z.object({
    contextAnalyzer: ContextAnalyzerStorageSchema,
    carbonCostEstimator: CarbonCostEstimatorStorageSchema.optional(),
    carbonEstimator: CarbonCostEstimatorStorageSchema.optional(),
    optimizer: OptimizerStorageSchema,
    actionRecommender: ActionRecommenderStorageSchema,
  }),
  recommendations: z.array(RecommendationSchema).max(4),
  bestAction: ActionRecommenderStorageSchema,
  selectedAction: RecommendationSchema.optional(),
  hedera: HederaMetadataSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const GreenAgentSessionSchema = RawGreenAgentSessionSchema.transform((session) => {
  const carbonCostEstimator =
    session.agents.carbonCostEstimator ??
    session.agents.carbonEstimator ?? {
      estimatedImpact: "low" as const,
      carbonExplanation: "Legacy session stored before carbon cost agent data was added.",
      mainCarbonDrivers: ["Legacy session"],
      sustainabilityRisk: "low" as const,
      estimatedRevenueLoss: 0,
      estimatedElectricityCost: 0,
      hiddenCostExplanation: "Legacy session stored before hidden cost estimates were added.",
    };
  const hiddenCostScore = session.hiddenCostScore ?? session.carbonScore ?? 0;

  return {
    ...session,
    currency: session.currency ?? "USD",
    hiddenCostScore,
    estimatedRevenueLoss:
      session.estimatedRevenueLoss ?? carbonCostEstimator.estimatedRevenueLoss,
    estimatedTimeLostMinutes:
      session.estimatedTimeLostMinutes ??
      session.agents.contextAnalyzer.estimatedLostFocusMinutes,
    estimatedElectricityCost:
      session.estimatedElectricityCost ?? carbonCostEstimator.estimatedElectricityCost,
    estimatedCarbonImpact:
      session.estimatedCarbonImpact ?? {
        level: carbonCostEstimator.estimatedImpact,
        explanation: carbonCostEstimator.carbonExplanation,
      },
    agents: {
      ...session.agents,
      carbonCostEstimator,
      optimizer: {
        ...session.agents.optimizer,
        hiddenCostScore,
      },
    },
    hedera: session.hedera,
  };
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
