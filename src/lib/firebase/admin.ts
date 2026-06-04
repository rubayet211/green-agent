import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

export function getAdminFirestore() {
  if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
      } catch (e) {
        console.error("Firebase admin initialization failed:", e);
        return null;
      }
    } else {
      return null;
    }
  }
  return admin.firestore();
}
