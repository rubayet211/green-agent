import { sessionStore } from "@/lib/firebase/sessions";
import { ApiError, apiErrorResponse } from "@/lib/http/api";
import { getRequestIdentity } from "@/lib/security/identity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const anonymousUserId = getRequestIdentity(request);
    if (!anonymousUserId) {
      throw new ApiError(401, "IDENTITY_REQUIRED", "Anonymous identity is required.");
    }
    const { id } = await params;
    const session = await sessionStore.getOwnedSession(id, anonymousUserId);
    if (!session) {
      throw new ApiError(404, "SESSION_NOT_FOUND", "Session not found.");
    }
    return Response.json(session);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
