export type SeverityLevel = "low" | "medium" | "high";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type Currency = "USD" | "BDT" | "INR" | "EUR" | "GBP";
export type AnalysisSource = "gemini" | "fallback";
export type WorkMode =
  | "Client Project"
  | "Proposal Writing"
  | "Research"
  | "Content Creation"
  | "Deep Work"
  | "Admin / Communication"
  | "Meetings"
  | "Creative Work"
  | "Study";

export interface ContextAnalyzerOutput {
  summary: string;
  focusRisks: string[];
  workPattern: string;
  severity: SeverityLevel;
  estimatedLostFocusMinutes: number;
  earningRiskExplanation: string;
}

export interface CarbonCostEstimatorOutput {
  estimatedImpact: SeverityLevel;
  carbonExplanation: string;
  mainCarbonDrivers: string[];
  sustainabilityRisk: SeverityLevel;
  estimatedRevenueLoss: number;
  estimatedElectricityCost: number;
  hiddenCostExplanation: string;
}

export type CarbonEstimatorOutput = CarbonCostEstimatorOutput;

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  productivityBenefit: string;
  sustainabilityBenefit: string;
  estimatedTimeSavedMinutes: number;
  estimatedFinancialBenefit: number;
  financialBenefitLabel: string;
  difficulty: DifficultyLevel;
  impact: SeverityLevel;
}

export interface OptimizerOutput {
  focusScore: number;
  hiddenCostScore: number;
  recommendations: Recommendation[];
  carbonScore?: number;
}

export interface ActionRecommenderOutput {
  bestActionTitle: string;
  bestActionReason: string;
  expectedOutcome: string;
  financialImpact: string;
  carbonImpact: string;
  milestoneLabel: "Sustainable Work Milestone";
}

export interface EstimatedCarbonImpact {
  level: SeverityLevel;
  explanation: string;
}

export interface HederaMetadata {
  topicId?: string;
  transactionId?: string;
  consensusTimestamp?: string;
  receiptStatus?: string;
  network?: "testnet" | "previewnet" | "mainnet";
  status: "pending" | "success" | "failed" | "simulated";
  actionType?: "SUSTAINABLE_WORK_MILESTONE";
  message?: string;
}

export interface GreenAgentSession {
  id: string;
  anonymousUserId: string;
  timestamp: string;
  tabs: number;
  hours: number;
  tasks: string;
  mode?: WorkMode;
  hourlyRate?: number;
  billablePercentage?: number;
  currency: Currency;
  focusScore: number;
  hiddenCostScore: number;
  carbonScore?: number;
  estimatedRevenueLoss: number;
  estimatedTimeLostMinutes: number;
  estimatedElectricityCost?: number;
  estimatedCarbonImpact?: EstimatedCarbonImpact;
  analysisSource?: AnalysisSource;
  agents: {
    contextAnalyzer: ContextAnalyzerOutput;
    carbonCostEstimator: CarbonCostEstimatorOutput;
    carbonEstimator?: CarbonCostEstimatorOutput;
    optimizer: OptimizerOutput;
    actionRecommender: ActionRecommenderOutput;
  };
  recommendations: Recommendation[];
  bestAction: ActionRecommenderOutput;
  selectedAction?: Recommendation;
  hedera?: HederaMetadata;
  createdAt: string;
  updatedAt: string;
}
