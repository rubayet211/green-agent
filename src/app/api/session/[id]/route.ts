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
  } catch (e: any) {
    console.error("Failed to retrieve session details:", e);
    return NextResponse.json({ error: e.message || "Session query failed" }, { status: 500 });
  }
}
