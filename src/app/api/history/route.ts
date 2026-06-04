import { sessionStore } from "@/lib/firebase/sessions";
import { ApiError, apiErrorResponse } from "@/lib/http/api";
import { getRequestIdentity } from "@/lib/security/identity";

export async function GET(request: Request) {
  try {
    const anonymousUserId = getRequestIdentity(request);
    if (!anonymousUserId) {
      throw new ApiError(401, "IDENTITY_REQUIRED", "Anonymous identity is required.");
    }
    return Response.json(await sessionStore.getHistory(anonymousUserId));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
