import { Storage } from "@google-cloud/storage";
import type { Readable } from "node:stream";
import { config } from "./config.js";

let storage: Storage | null = null;

function getStorage() {
  if (!config.GCS_BUCKET) return null;
  storage ??= new Storage();
  return storage;
}

export async function objectExists(objectPath: string): Promise<boolean> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return false;
  const [exists] = await client.bucket(config.GCS_BUCKET).file(objectPath).exists();
  return exists;
}

/** Stream a GCS object through the API (avoids signBlob on Cloud Run). */
export async function openObjectStream(objectPath: string): Promise<{
  stream: Readable;
  contentType: string;
  fileName: string;
} | null> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return null;

  const file = client.bucket(config.GCS_BUCKET).file(objectPath);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [metadata] = await file.getMetadata();
  const fileName = objectPath.split("/").pop() ?? "download";
  const contentType = metadata.contentType ?? "application/octet-stream";

  return { stream: file.createReadStream(), contentType, fileName };
}
