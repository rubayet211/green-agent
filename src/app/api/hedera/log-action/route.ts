import { sessionStore } from "@/lib/firebase/sessions";
import { isHederaSignatureError, submitToTopic } from "@/lib/hedera/client";
import { buildSustainableWorkMilestonePayload } from "@/lib/hedera/milestone-payload";
import { ApiError, apiErrorResponse, readJsonBody } from "@/lib/http/api";
import { getRequestIdentity } from "@/lib/security/identity";
import { apiRateLimiter } from "@/lib/security/rate-limit";
import { HederaLogRequestSchema } from "@/lib/validations/greenagent";

const HEDERA_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function POST(request: Request) {
  try {
    const anonymousUserId = getRequestIdentity(request);
    if (!anonymousUserId) {
      throw new ApiError(401, "IDENTITY_REQUIRED", "Anonymous identity is required.");
    }
    const rateLimit = apiRateLimiter.consume(
      `hedera:${anonymousUserId}`,
      HEDERA_RATE_LIMIT,
    );
    if (!rateLimit.allowed) {
      throw new ApiError(429, "RATE_LIMITED", "Too many Hedera requests. Try again shortly.");
    }

    const { sessionId, actionId } = await readJsonBody(request, HederaLogRequestSchema, 4_096);
    const session = await sessionStore.getOwnedSession(sessionId, anonymousUserId);
    if (!session) {
      throw new ApiError(404, "SESSION_NOT_FOUND", "Session not found.");
    }
    const recommendation = session.recommendations.find((item) => item.id === actionId);
    if (!recommendation) {
      throw new ApiError(404, "RECOMMENDATION_NOT_FOUND", "Recommendation not found.");
    }

    let result: Awaited<ReturnType<typeof submitToTopic>>;
    try {
      result = await submitToTopic(
        buildSustainableWorkMilestonePayload({
          session,
          recommendation,
          network: `hedera-${process.env.HEDERA_NETWORK || "testnet"}`,
        }),
      );
    } catch (error) {
      if (isHederaSignatureError(error)) {
        throw new ApiError(
          502,
          "HEDERA_INVALID_SIGNATURE",
          "Hedera rejected the configured operator signature. Check that HEDERA_PRIVATE_KEY matches HEDERA_ACCOUNT_ID and uses the correct key type.",
        );
      }
      throw error;
    }

    session.selectedAction = recommendation;
    session.hedera =
      result.status === "success"
        ? {
            topicId: result.topicId,
            transactionId: result.transactionId,
            consensusTimestamp: result.consensusTimestamp,
            receiptStatus: result.receiptStatus,
            network: result.network,
            status: "success",
            actionType: "SUSTAINABLE_WORK_MILESTONE",
            message: "Your Sustainable Work Milestone was recorded on Hedera.",
          }
        : {
            network: result.network,
            status: "simulated",
            actionType: "SUSTAINABLE_WORK_MILESTONE",
            message: `Simulation only: ${result.reason}`,
          };
    session.updatedAt = new Date().toISOString();
    await sessionStore.saveSession(session);
    return Response.json(session);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
