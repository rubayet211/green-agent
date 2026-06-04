import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/firebase/sessions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const anonymousUserId = searchParams.get("anonymousUserId");

    if (!anonymousUserId) {
      return NextResponse.json({ error: "anonymousUserId query parameter is required" }, { status: 400 });
    }

    const list = await sessionStore.getHistory(anonymousUserId);
    return NextResponse.json(list);
  } catch (e: any) {
    console.error("Failed to query history:", e);
    return NextResponse.json({ error: e.message || "History query failed" }, { status: 500 });
  }
}
