import { z } from "zod";

const ShortTextSchema = z.string().trim().min(1).max(500);
const RiskListSchema = z.array(ShortTextSchema).min(1).max(5);

export const AnalyzeRequestSchema = z.object({
  tabs: z.number().int().min(0).max(300),
  hours: z.number().finite().min(0).max(24),
  tasks: z.string().trim().min(1, "Tasks list cannot be empty").max(1_000),
  mode: z.enum(["Deep Work", "Research", "Meetings", "Creative Work", "Study"]).optional(),
});

export const HederaLogRequestSchema = z.object({
  sessionId: z.string().uuid(),
  actionId: z.string().min(1).max(100),
});

export const ContextAnalyzerOutputSchema = z.object({
  summary: ShortTextSchema,
  focusRisks: RiskListSchema,
  workPattern: ShortTextSchema,
  severity: z.enum(["low", "medium", "high"]),
});

export const CarbonEstimatorOutputSchema = z.object({
  estimatedImpact: z.enum(["low", "medium", "high"]),
  carbonExplanation: ShortTextSchema,
  mainCarbonDrivers: RiskListSchema,
  sustainabilityRisk: z.enum(["low", "medium", "high"]),
});

export const RecommendationAgentOutputSchema = z.object({
  title: ShortTextSchema,
  description: ShortTextSchema,
  productivityBenefit: ShortTextSchema,
  sustainabilityBenefit: ShortTextSchema,
  difficulty: z.enum(["easy", "medium", "hard"]),
  impact: z.enum(["low", "medium", "high"]),
});

export const RecommendationSchema = RecommendationAgentOutputSchema.extend({
  id: z.string().min(1).max(100),
});

export const OptimizerAgentOutputSchema = z.object({
  focusScore: z.number().finite().min(0).max(100),
  carbonScore: z.number().finite().min(0).max(100),
  recommendations: z.array(RecommendationAgentOutputSchema).min(3).max(4),
});

export const ActionRecommenderOutputSchema = z.object({
  bestActionTitle: ShortTextSchema,
  bestActionReason: ShortTextSchema,
  expectedOutcome: ShortTextSchema,
});

export const GreenAgentSessionSchema = z.object({
  id: z.string().uuid(),
  anonymousUserId: z.string().uuid(),
  timestamp: z.string().datetime(),
  tabs: z.number().int().min(0).max(300),
  hours: z.number().finite().min(0).max(24),
  tasks: z.string().min(1).max(1_000),
  mode: z.enum(["Deep Work", "Research", "Meetings", "Creative Work", "Study"]).optional(),
  focusScore: z.number().finite().min(0).max(100),
  carbonScore: z.number().finite().min(0).max(100),
  analysisSource: z.enum(["gemini", "fallback"]).optional(),
  agents: z.object({
    contextAnalyzer: ContextAnalyzerOutputSchema,
    carbonEstimator: CarbonEstimatorOutputSchema,
    optimizer: z.object({
      focusScore: z.number().finite().min(0).max(100),
      carbonScore: z.number().finite().min(0).max(100),
      recommendations: z.array(RecommendationSchema).max(4),
    }),
    actionRecommender: ActionRecommenderOutputSchema,
  }),
  recommendations: z.array(RecommendationSchema).max(4),
  bestAction: ActionRecommenderOutputSchema,
  selectedAction: RecommendationSchema.optional(),
  hedera: z
    .object({
      topicId: z.string().optional(),
      transactionId: z.string().optional(),
      consensusTimestamp: z.string().optional(),
      receiptStatus: z.string().optional(),
      network: z.enum(["testnet", "previewnet", "mainnet"]).optional(),
      status: z.enum(["pending", "success", "failed", "simulated"]),
      message: z.string().optional(),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
