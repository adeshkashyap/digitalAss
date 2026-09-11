/** Read a localStorage key, falling back to a legacy key and migrating when found. */
export function readStorageKey(key: string, legacyKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy !== null) {
      window.localStorage.setItem(key, legacy);
      window.localStorage.removeItem(legacyKey);
    }
    return legacy;
  } catch {
    return null;
  }
}
