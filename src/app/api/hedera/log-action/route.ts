import { NextResponse } from "next/server";
import { HederaLogRequestSchema } from "@/lib/validations/greenagent";
import { sessionStore } from "@/lib/firebase/sessions";
import { submitToTopic } from "@/lib/hedera/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request schema
    const { sessionId, actionId } = HederaLogRequestSchema.parse(body);

    const session = await sessionStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const recommendation = session.recommendations.find(r => r.id === actionId);
    if (!recommendation) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    const logPayload = {
      app: "GreenAgent",
      type: "GREEN_ACTION_LOG",
      timestamp: new Date().toISOString(),
      sessionId: session.id,
      focusScore: session.focusScore,
      carbonScore: session.carbonScore,
      actionTitle: recommendation.title,
      actionDescription: recommendation.description,
      network: "hedera-testnet"
    };

    let result = await submitToTopic(logPayload);

    if (!result) {
      // Run simulated HCS logging when no Hedera accounts are set up
      const mockTxId = `0.0.${Math.floor(Math.random() * 100000)}@${Date.now().toString().slice(0, 10)}.${Math.floor(Math.random() * 10000)}`;
      const mockTopicId = process.env.HEDERA_TOPIC_ID || "0.0.9999-mock";
      result = {
        topicId: mockTopicId,
        transactionId: mockTxId,
        consensusTimestamp: new Date().toISOString(),
        status: "simulated"
      };
    }

    session.selectedAction = recommendation;
    session.hedera = {
      topicId: result.topicId,
      transactionId: result.transactionId,
      consensusTimestamp: result.consensusTimestamp,
      status: result.status as "success" | "simulated",
      message: `Your green action has been logged on Hedera Testnet${result.status === "simulated" ? " (Simulated Mode)" : ""}.`
    };
    session.updatedAt = new Date().toISOString();

    await sessionStore.saveSession(session);

    return NextResponse.json(session);
  } catch (e: any) {
    console.error("Hedera log action route crash:", e);
    return NextResponse.json({ error: e.message || "Failed to log on Hedera" }, { status: 500 });
  }
}
