/** Base URL for the ApnaCodex API (backend). Defaults to local dev server. */
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
};
