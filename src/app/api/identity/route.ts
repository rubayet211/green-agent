import {
  buildIdentityCookie,
  createIdentityToken,
  getRequestIdentity,
} from "@/lib/security/identity";
import { apiErrorResponse } from "@/lib/http/api";

export async function POST(request: Request) {
  try {
    const existing = getRequestIdentity(request);
    const response = Response.json({ ready: true }, { status: existing ? 200 : 201 });
    if (!existing) {
      response.headers.append("Set-Cookie", buildIdentityCookie(createIdentityToken()));
    }
    return response;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
