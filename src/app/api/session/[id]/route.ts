import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/firebase/sessions";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await sessionStore.getSession(id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (e) {
    console.error("Failed to retrieve session details:", e);
    const errMsg = e instanceof Error ? e.message : "Session query failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
