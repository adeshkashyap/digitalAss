import { Storage } from "@google-cloud/storage";
import { config } from "./config.js";

let storage: Storage | null = null;

function getStorage() {
  if (!config.GCS_BUCKET) return null;
  storage ??= new Storage();
  return storage;
}

export async function getSignedDownloadUrl(objectPath: string): Promise<string | null> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return null;

  const file = client.bucket(config.GCS_BUCKET).file(objectPath);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });
  return url;
}

export async function objectExists(objectPath: string): Promise<boolean> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return false;
  const [exists] = await client.bucket(config.GCS_BUCKET).file(objectPath).exists();
  return exists;
}
