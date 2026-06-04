export interface ContextAnalyzerOutput {
  summary: string;
  focusRisks: string[];
  workPattern: string;
  severity: "low" | "medium" | "high";
}

export interface CarbonEstimatorOutput {
  estimatedImpact: "low" | "medium" | "high";
  carbonExplanation: string;
  mainCarbonDrivers: string[];
  sustainabilityRisk: "low" | "medium" | "high";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  productivityBenefit: string;
  sustainabilityBenefit: string;
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
}

export interface OptimizerOutput {
  focusScore: number;
  carbonScore: number;
  recommendations: Recommendation[];
}

export interface ActionRecommenderOutput {
  bestActionTitle: string;
  bestActionReason: string;
  expectedOutcome: string;
}

export interface GreenAgentSession {
  id: string;
  anonymousUserId: string;
  timestamp: string;
  tabs: number;
  hours: number;
  tasks: string;
  mode?: string;
  focusScore: number;
  carbonScore: number;
  agents: {
    contextAnalyzer: ContextAnalyzerOutput;
    carbonEstimator: CarbonEstimatorOutput;
    optimizer: OptimizerOutput;
    actionRecommender: ActionRecommenderOutput;
  };
  recommendations: Recommendation[];
  bestAction: ActionRecommenderOutput;
  selectedAction?: Recommendation;
  hedera?: {
    topicId?: string;
    transactionId?: string;
    consensusTimestamp?: string;
    status: "pending" | "success" | "failed" | "simulated";
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}
