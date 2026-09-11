import { readStorageKey } from "@/lib/storage-migrate";

const TOKEN_KEY = "apnacodex.auth.token";
const LEGACY_TOKEN_KEY = "devassets.auth.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return readStorageKey(TOKEN_KEY, LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
