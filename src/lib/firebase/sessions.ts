import { GreenAgentSession } from "@/types/greenagent";
import { getAdminFirestore } from "./admin";
import fs from "fs/promises";
import path from "path";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "local_sessions.json");

async function ensureLocalDirectory() {
  await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
  try {
    await fs.access(LOCAL_DB_PATH);
  } catch {
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify([]));
  }
}

async function readLocalSessions(): Promise<GreenAgentSession[]> {
  await ensureLocalDirectory();
  const data = await fs.readFile(LOCAL_DB_PATH, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLocalSessions(sessions: GreenAgentSession[]) {
  await ensureLocalDirectory();
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(sessions, null, 2));
}

export const sessionStore = {
  async saveSession(session: GreenAgentSession): Promise<void> {
    const firestore = getAdminFirestore();
    if (firestore) {
      await firestore.collection("sessions").doc(session.id).set(session);
    } else {
      const sessions = await readLocalSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      if (existingIndex > -1) {
        sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() };
      } else {
        sessions.push(session);
      }
      await writeLocalSessions(sessions);
    }
  },

  async getSession(id: string): Promise<GreenAgentSession | null> {
    const firestore = getAdminFirestore();
    if (firestore) {
      const doc = await firestore.collection("sessions").doc(id).get();
      return doc.exists ? (doc.data() as GreenAgentSession) : null;
    } else {
      const sessions = await readLocalSessions();
      return sessions.find(s => s.id === id) || null;
    }
  },

  async getHistory(anonymousUserId: string): Promise<GreenAgentSession[]> {
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snapshot = await firestore
          .collection("sessions")
          .where("anonymousUserId", "==", anonymousUserId)
          .orderBy("createdAt", "desc")
          .get();
        const list: GreenAgentSession[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data() as GreenAgentSession);
        });
        return list;
      } catch (dbError) {
        console.error("Firestore history query failed, fetching local history fallback:", dbError);
        // Fall back to local logs if firestore query errors out (e.g. index missing)
      }
    }
    const sessions = await readLocalSessions();
    return sessions
      .filter(s => s.anonymousUserId === anonymousUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
