export async function ensureAnonymousIdentity(): Promise<void> {
  const response = await fetch("/api/identity", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error("Unable to initialize anonymous identity.");
  }
}
