# GCP CI/CD — Backend (`backend` branch)

Automatic deploy to **Cloud Run** on every push to the `backend` branch.

## One-time setup

```bash
chmod +x scripts/gcp-bootstrap.sh
./scripts/gcp-bootstrap.sh
```

This script:
- Enables Cloud Build, Cloud Run, Artifact Registry, Secret Manager
- Creates Docker repo `devassets` in `us-central1`
- Creates placeholder secrets (`devassets-database-url`, `devassets-jwt-secret`)
- Creates GitHub triggers for `backend` and `frontend` branches

## Database (Cloud SQL)

1. Create a PostgreSQL instance in GCP Console or:

```bash
gcloud sql instances create devassets-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

2. Set the connection string in Secret Manager:

```bash
echo -n 'postgresql://USER:PASS@/devassets?host=/cloudsql/PROJECT:REGION:INSTANCE' | \
  gcloud secrets versions add devassets-database-url --data-file=-
```

3. Attach Cloud SQL to Cloud Run (after first deploy):

```bash
gcloud run services update devassets-api \
  --region=us-central1 \
  --add-cloudsql-instances=PROJECT:REGION:INSTANCE
```

## Secrets

| Secret | Purpose |
|--------|---------|
| `devassets-database-url` | PostgreSQL connection string |
| `devassets-jwt-secret` | JWT signing key (32+ chars) |

Optional: add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` via Cloud Run env or secrets.

## Local Docker test

```bash
docker build -t devassets-api .
docker run -p 8080:8080 -e DATABASE_URL=... -e JWT_SECRET=... devassets-api
```

## Workflow

```
git push origin backend  →  Cloud Build  →  Cloud Run (devassets-api)
git push origin frontend →  Cloud Build  →  Cloud Run (devassets-web)
```
