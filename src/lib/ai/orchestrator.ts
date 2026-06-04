import crypto from "node:crypto";
import { callAgent, isExpectedGeminiFallback, summarizeGeminiError } from "./gemini";
import { createFallbackAnalysis, type AnalysisResult } from "./fallback";
import {
  ACTION_RECOMMENDER_PROMPT,
  CARBON_ESTIMATOR_PROMPT,
  CONTEXT_ANALYZER_PROMPT,
  OPTIMIZER_PROMPT,
} from "./prompts";
import {
  ActionRecommenderOutputSchema,
  CarbonEstimatorOutputSchema,
  ContextAnalyzerOutputSchema,
  OptimizerAgentOutputSchema,
  type AnalyzeRequest,
} from "@/lib/validations/greenagent";
import type { Recommendation } from "@/types/greenagent";

type AgentCaller = typeof callAgent;

interface RunAnalysisOptions {
  aiEnabled?: boolean;
  invoke?: AgentCaller;
}

function fillPrompt(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (prompt, [key, value]) => prompt.replace(`{{${key}}}`, value),
    template,
  );
}

export async function runAnalysis(
  input: AnalyzeRequest,
  options: RunAnalysisOptions = {},
): Promise<AnalysisResult> {
  const aiEnabled = options.aiEnabled ?? Boolean(process.env.GEMINI_API_KEY);
  if (!aiEnabled) return createFallbackAnalysis(input);
  const invoke = options.invoke ?? callAgent;

  try {
    const base = {
      tabs: String(input.tabs),
      hours: String(input.hours),
      tasks: input.tasks,
      mode: input.mode || "Standard",
    };
    const contextAnalyzer = await invoke(
      fillPrompt(CONTEXT_ANALYZER_PROMPT, base),
      ContextAnalyzerOutputSchema,
    );
    const carbonEstimator = await invoke(
      fillPrompt(CARBON_ESTIMATOR_PROMPT, {
        ...base,
        contextOutput: JSON.stringify(contextAnalyzer),
      }),
      CarbonEstimatorOutputSchema,
    );
    const optimizer = await invoke(
      fillPrompt(OPTIMIZER_PROMPT, {
        ...base,
        contextOutput: JSON.stringify(contextAnalyzer),
        carbonOutput: JSON.stringify(carbonEstimator),
      }),
      OptimizerAgentOutputSchema,
    );
    const recommendations: Recommendation[] = optimizer.recommendations.map(
      (recommendation, index) => ({
        ...recommendation,
        id: `rec-${index}-${crypto.randomBytes(4).toString("hex")}`,
      }),
    );
    const requestedBestAction = await invoke(
      fillPrompt(ACTION_RECOMMENDER_PROMPT, {
        ...base,
        recommendations: JSON.stringify(recommendations),
      }),
      ActionRecommenderOutputSchema,
    );
    const selectedRecommendation =
      recommendations.find(
        (recommendation) =>
          recommendation.title.toLowerCase() ===
          requestedBestAction.bestActionTitle.toLowerCase(),
      ) ?? recommendations[0];
    const bestAction = {
      ...requestedBestAction,
      bestActionTitle: selectedRecommendation.title,
    };

    return {
      contextAnalyzer,
      carbonEstimator,
      focusScore: optimizer.focusScore,
      carbonScore: optimizer.carbonScore,
      recommendations,
      bestAction,
      source: "gemini",
    };
  } catch (error) {
    if (isExpectedGeminiFallback(error)) {
      console.warn(
        `Gemini unavailable; using validated fallback (${summarizeGeminiError(error)}).`,
      );
    } else {
      console.error("Gemini orchestration failed; using validated fallback:", error);
    }
    return createFallbackAnalysis(input);
  }
}
