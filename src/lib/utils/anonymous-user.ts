export function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "server-side";
  const storageKey = "greenagent_user_id";
  let storedId = localStorage.getItem(storageKey);
  if (!storedId) {
    storedId = "usr_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
    localStorage.setItem(storageKey, storedId);
  }
  return storedId;
}
