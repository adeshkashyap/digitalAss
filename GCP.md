# GCP CI/CD — Frontend (`frontend` branch)

Automatic deploy to **Cloud Run** on every push to the `frontend` branch.

## One-time setup

From the **backend** branch, run the bootstrap script (creates shared GCP resources and both triggers):

```bash
git checkout backend
chmod +x scripts/gcp-bootstrap.sh
./scripts/gcp-bootstrap.sh
```

Or manually:

1. Connect GitHub repo in [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Create trigger: branch `^frontend$`, config `cloudbuild.yaml`
3. Set substitution `_API_URL` to your backend Cloud Run URL

## Local Docker test

```bash
docker build --build-arg VITE_API_URL=http://localhost:4000 -t devassets-web .
docker run -p 8080:8080 devassets-web
```

## Environment

| Build arg / env | Purpose |
|-----------------|--------|
| `VITE_API_URL` | Backend API URL (baked at build time) |
| `NITRO_PRESET=node-server` | Node server for Cloud Run (set in Dockerfile) |
