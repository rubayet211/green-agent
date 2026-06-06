import type { GreenAgentSession } from "@/types/greenagent";

export function isSustainableWorkMilestone(session: GreenAgentSession): boolean {
  return Boolean(
    session.selectedAction &&
      session.hedera?.actionType === "SUSTAINABLE_WORK_MILESTONE" &&
      (session.hedera.status === "success" || session.hedera.status === "simulated"),
  );
}

export function countSustainableWorkMilestones(
  sessions: GreenAgentSession[],
): number {
  return sessions.filter(isSustainableWorkMilestone).length;
}
