import crypto from "node:crypto";
import { calculateFallbackScores } from "@/lib/utils/score";
import type {
  ActionRecommenderOutput,
  CarbonEstimatorOutput,
  ContextAnalyzerOutput,
  Recommendation,
} from "@/types/greenagent";
import type { AnalyzeRequest } from "@/lib/validations/greenagent";

export interface AnalysisResult {
  contextAnalyzer: ContextAnalyzerOutput;
  carbonEstimator: CarbonEstimatorOutput;
  focusScore: number;
  carbonScore: number;
  recommendations: Recommendation[];
  bestAction: ActionRecommenderOutput;
  source: "gemini" | "fallback";
}

function recommendationId(index: number): string {
  return `rec-${index}-${crypto.randomBytes(4).toString("hex")}`;
}

export function createFallbackAnalysis(input: AnalyzeRequest): AnalysisResult {
  const { tabs, hours, tasks } = input;
  const scores = calculateFallbackScores({ tabs, hours, tasks });
  const recommendations: Recommendation[] = [
    {
      id: recommendationId(0),
      title: "Consolidate unused tabs",
      description: "Keep only 5 core tabs open. Save the rest in a bookmark folder.",
      productivityBenefit: "Decreases brain clutter and contextual load.",
      sustainabilityBenefit: "Saves memory power load and reduces periodic network traffic.",
      difficulty: "easy",
      impact: "medium",
    },
    {
      id: recommendationId(1),
      title: "Implement a digital blackout hour",
      description: "Turn off the screen for 60 minutes and outline plans on paper.",
      productivityBenefit: "Supports direct focus away from messaging channels.",
      sustainabilityBenefit: "Avoids display and background-compute energy for that block.",
      difficulty: "medium",
      impact: "high",
    },
    {
      id: recommendationId(2),
      title: "Pause unnecessary auto-sync",
      description: "Pause nonessential sync services during the next focus block.",
      productivityBenefit: "Prevents background notifications and rebuild distractions.",
      sustainabilityBenefit: "Reduces repeated background network and server work.",
      difficulty: "medium",
      impact: "high",
    },
  ];

  return {
    contextAnalyzer: {
      summary: `Current workload includes ${tabs} tabs and ${hours} screen hours.`,
      focusRisks:
        tabs > 25
          ? ["High multitasking behavior", "Context-switching penalties"]
          : ["Moderate context switching"],
      workPattern: tabs > 30 ? "Heavy multi-tab explorer" : "Focused workstation",
      severity: tabs > 30 || hours > 8 ? "medium" : "low",
    },
    carbonEstimator: {
      estimatedImpact: hours > 8 ? "high" : "medium",
      carbonExplanation: `Screen time of ${hours} hours and ${tabs} tabs can increase background processing and display energy use.`,
      mainCarbonDrivers: ["Background tab syncing", "Sustained display energy usage"],
      sustainabilityRisk: hours > 10 ? "high" : "medium",
    },
    focusScore: scores.focusScore,
    carbonScore: scores.carbonScore,
    recommendations,
    bestAction: {
      bestActionTitle: recommendations[0].title,
      bestActionReason: "It provides an immediate focus benefit with low effort.",
      expectedOutcome: "Reduced context switching and background tab activity.",
    },
    source: "fallback",
  };
}
