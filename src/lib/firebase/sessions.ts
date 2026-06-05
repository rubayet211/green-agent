import fs from "node:fs/promises";
import path from "node:path";
import { getAdminFirestore } from "./admin";
import { GreenAgentSessionSchema } from "@/lib/validations/greenagent";
import type { GreenAgentSession } from "@/types/greenagent";

let localWriteQueue = Promise.resolve();

function localDbPath(): string {
  const fileName =
    process.env.NODE_ENV === "test" ? "local_sessions.test.json" : "local_sessions.json";
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", fileName);
}

function assertLocalFallbackAllowed(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Firestore configuration is required in production.");
  }
}

function shouldFallbackToLocal(error: unknown): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const reason =
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
      ? error.reason
      : "unavailable";
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
      ? `code ${error.code}`
      : "unknown code";
  console.warn(`Firestore ${reason} (${code}); using local development storage.`);
  return true;
}

async function ensureLocalDirectory() {
  assertLocalFallbackAllowed();
  const dbPath = localDbPath();
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify([]));
  }
}

function parseSession(value: unknown): GreenAgentSession | null {
  const parsed = GreenAgentSessionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

async function readLocalSessions(): Promise<GreenAgentSession[]> {
  await ensureLocalDirectory();
  try {
    const values = JSON.parse(await fs.readFile(localDbPath(), "utf-8")) as unknown;
    return Array.isArray(values)
      ? values.flatMap((value) => {
          const session = parseSession(value);
          return session ? [session] : [];
        })
      : [];
  } catch {
    return [];
  }
}

function canReadLocalFallback(): boolean {
  return process.env.NODE_ENV !== "production";
}

async function writeLocalSession(session: GreenAgentSession): Promise<void> {
  localWriteQueue = localWriteQueue.then(async () => {
    const sessions = await readLocalSessions();
    const existingIndex = sessions.findIndex((item) => item.id === session.id);
    if (existingIndex >= 0) sessions[existingIndex] = session;
    else sessions.push(session);
    await fs.writeFile(localDbPath(), JSON.stringify(sessions, null, 2));
  });
  await localWriteQueue;
}

export const sessionStore = {
  async saveSession(value: GreenAgentSession): Promise<void> {
    const session = GreenAgentSessionSchema.parse(value);
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        await firestore.collection("sessions").doc(session.id).set(session);
        return;
      } catch (error) {
        if (!shouldFallbackToLocal(error)) throw error;
      }
    }
    assertLocalFallbackAllowed();
    await writeLocalSession(session);
  },

  async getSession(id: string): Promise<GreenAgentSession | null> {
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const document = await firestore.collection("sessions").doc(id).get();
        if (document.exists) return parseSession(document.data());
        if (!canReadLocalFallback()) return null;
      } catch (error) {
        if (!shouldFallbackToLocal(error)) throw error;
      }
    }
    assertLocalFallbackAllowed();
    const sessions = await readLocalSessions();
    return sessions.find((session) => session.id === id) || null;
  },

  async getOwnedSession(id: string, anonymousUserId: string): Promise<GreenAgentSession | null> {
    const session = await this.getSession(id);
    return session?.anonymousUserId === anonymousUserId ? session : null;
  },

  async getHistory(anonymousUserId: string, requestedLimit = 20): Promise<GreenAgentSession[]> {
    const limit = Math.min(Math.max(Math.floor(requestedLimit), 1), 50);
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snapshot = await firestore
          .collection("sessions")
          .where("anonymousUserId", "==", anonymousUserId)
          .orderBy("createdAt", "desc")
          .limit(limit)
          .get();
        const parsed = snapshot.docs.flatMap((document) => {
          const session = parseSession(document.data());
          return session ? [session] : [];
        });
        if (parsed.length > 0 || !canReadLocalFallback()) return parsed;
      } catch (error) {
        if (!shouldFallbackToLocal(error)) throw error;
      }
    }
    assertLocalFallbackAllowed();
    const sessions = await readLocalSessions();
    return sessions
      .filter((session) => session.anonymousUserId === anonymousUserId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit);
  },
};
