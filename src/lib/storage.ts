import { Storage } from "@google-cloud/storage";
import { config } from "./config.js";

let storage: Storage | null = null;
let signingServiceAccount: string | null | undefined;

function getStorage() {
  if (!config.GCS_BUCKET) return null;
  storage ??= new Storage();
  return storage;
}

/** Resolve the service account email used to sign GCS URLs on Cloud Run / GCE. */
async function resolveSigningServiceAccount(): Promise<string | null> {
  if (config.GCS_SIGNING_SERVICE_ACCOUNT) return config.GCS_SIGNING_SERVICE_ACCOUNT;

  if (signingServiceAccount !== undefined) return signingServiceAccount;

  if (process.env.K_SERVICE || process.env.GAE_SERVICE) {
    try {
      const res = await fetch(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
        { headers: { "Metadata-Flavor": "Google" } },
      );
      if (res.ok) {
        signingServiceAccount = (await res.text()).trim();
        return signingServiceAccount;
      }
    } catch {
      // Not running on GCP — fall through.
    }
  }

  signingServiceAccount = null;
  return null;
}

export async function getSignedDownloadUrl(objectPath: string): Promise<string | null> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return null;

  const file = client.bucket(config.GCS_BUCKET).file(objectPath);
  const [exists] = await file.exists();
  if (!exists) return null;

  const expires = Date.now() + 15 * 60 * 1000;
  const signer = await resolveSigningServiceAccount();

  const signOptions: {
    version: "v4";
    action: "read";
    expires: number;
    signingEndpoint?: string;
  } = {
    version: "v4",
    action: "read",
    expires,
  };

  if (signer) {
    signOptions.signingEndpoint = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(signer)}:signBlob`;
  }

  const [url] = await file.getSignedUrl(signOptions);
  return url;
}

export async function objectExists(objectPath: string): Promise<boolean> {
  const client = getStorage();
  if (!client || !config.GCS_BUCKET) return false;
  const [exists] = await client.bucket(config.GCS_BUCKET).file(objectPath).exists();
  return exists;
}
