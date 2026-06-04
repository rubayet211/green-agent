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

    let hederaStatus: "success" | "simulated" = "success";
    let hederaTopicId = "";
    let hederaTxId = "";
    let hederaConsensusTimestamp = "";

    const result = await submitToTopic(logPayload);

    if (result) {
      hederaStatus = "success";
      hederaTopicId = result.topicId;
      hederaTxId = result.transactionId;
      hederaConsensusTimestamp = result.consensusTimestamp;
    } else {
      hederaStatus = "simulated";
      hederaTopicId = process.env.HEDERA_TOPIC_ID || "0.0.9999-mock";
      hederaTxId = `0.0.${Math.floor(Math.random() * 100000)}@${Date.now().toString().slice(0, 10)}.${Math.floor(Math.random() * 10000)}`;
      hederaConsensusTimestamp = new Date().toISOString();
    }

    session.selectedAction = recommendation;
    session.hedera = {
      topicId: hederaTopicId,
      transactionId: hederaTxId,
      consensusTimestamp: hederaConsensusTimestamp,
      status: hederaStatus,
      message: `Your green action has been logged on Hedera Testnet${hederaStatus === "simulated" ? " (Simulated Mode)" : ""}.`
    };
    session.updatedAt = new Date().toISOString();

    await sessionStore.saveSession(session);

    return NextResponse.json(session);
  } catch (e) {
    console.error("Hedera log action route crash:", e);
    const errMsg = e instanceof Error ? e.message : "Failed to log on Hedera";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
