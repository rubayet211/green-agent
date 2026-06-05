import crypto from "node:crypto";
import { runAnalysis } from "@/lib/ai/orchestrator";
import { sessionStore } from "@/lib/firebase/sessions";
import { ApiError, apiErrorResponse, readJsonBody } from "@/lib/http/api";
import { getRequestIdentity } from "@/lib/security/identity";
import { apiRateLimiter } from "@/lib/security/rate-limit";
import { AnalyzeRequestSchema } from "@/lib/validations/greenagent";
import type { GreenAgentSession } from "@/types/greenagent";

const ANALYZE_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function POST(request: Request) {
  try {
    const anonymousUserId = getRequestIdentity(request);
    if (!anonymousUserId) {
      throw new ApiError(401, "IDENTITY_REQUIRED", "Anonymous identity is required.");
    }

    const rateLimit = apiRateLimiter.consume(
      `analyze:${anonymousUserId}`,
      ANALYZE_RATE_LIMIT,
    );
    if (!rateLimit.allowed) {
      throw new ApiError(429, "RATE_LIMITED", "Too many analysis requests. Try again shortly.");
    }

    const input = await readJsonBody(request, AnalyzeRequestSchema);
    const analysis = await runAnalysis(input);
    const now = new Date().toISOString();
    const session: GreenAgentSession = {
      id: crypto.randomUUID(),
      anonymousUserId,
      timestamp: now,
      ...input,
      focusScore: analysis.focusScore,
      hiddenCostScore: analysis.hiddenCostScore,
      carbonScore: analysis.hiddenCostScore,
      estimatedRevenueLoss: analysis.estimatedRevenueLoss,
      estimatedTimeLostMinutes: analysis.estimatedTimeLostMinutes,
      estimatedElectricityCost: analysis.estimatedElectricityCost,
      estimatedCarbonImpact: analysis.estimatedCarbonImpact,
      currency: analysis.currency,
      hourlyRate: input.hourlyRate,
      billablePercentage: input.billablePercentage,
      analysisSource: analysis.source,
      agents: {
        contextAnalyzer: analysis.contextAnalyzer,
        carbonCostEstimator: analysis.carbonCostEstimator,
        optimizer: {
          focusScore: analysis.focusScore,
          hiddenCostScore: analysis.hiddenCostScore,
          carbonScore: analysis.hiddenCostScore,
          recommendations: analysis.recommendations,
        },
        actionRecommender: analysis.bestAction,
      },
      recommendations: analysis.recommendations,
      bestAction: analysis.bestAction,
      createdAt: now,
      updatedAt: now,
    };

    await sessionStore.saveSession(session);
    return Response.json(session);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
