#!/usr/bin/env bash
# One-time GCP setup for DevAssets CI/CD (frontend + backend Cloud Run)
set -euo pipefail

REGION="${REGION:-us-central1}"
AR_REPO="${AR_REPO:-devassets}"
GITHUB_OWNER="${GITHUB_OWNER:-adeshkashyap}"
GITHUB_REPO="${GITHUB_REPO:-digitalAss}"
PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"

if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "(unset)" ]]; then
  echo "Error: No GCP project selected. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "==> Project: $PROJECT_ID | Region: $REGION"

echo "==> Enabling APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Granting Cloud Build permission to deploy Cloud Run & push images..."
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser" \
  --quiet >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet >/dev/null

echo "==> Creating Artifact Registry repository (if missing)..."
if ! gcloud artifacts repositories describe "$AR_REPO" --location="$REGION" &>/dev/null; then
  gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="DevAssets container images"
fi

echo "==> Creating Secret Manager secrets (placeholders — update before production)..."
create_secret_if_missing() {
  local name="$1"
  local value="$2"
  if ! gcloud secrets describe "$name" --project="$PROJECT_ID" &>/dev/null; then
    echo -n "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT_ID"
    echo "    Created secret: $name"
  else
    echo "    Secret exists: $name"
  fi
}

create_secret_if_missing "devassets-database-url" \
  "postgresql://postgres:postgres@localhost:5432/devassets?schema=public"
create_secret_if_missing "devassets-jwt-secret" \
  "change-me-use-long-random-string-in-production"

echo ""
echo "==> GitHub connection"
echo "    If not connected yet, open:"
echo "    https://console.cloud.google.com/cloud-build/triggers;region=global/connect?project=${PROJECT_ID}"
echo "    Connect repository: ${GITHUB_OWNER}/${GITHUB_REPO}"
echo ""

if [[ "${NONINTERACTIVE:-}" != "1" ]]; then
  read -r -p "Press Enter after GitHub is connected (or Ctrl+C to abort)..."
fi

create_trigger() {
  local name="$1"
  local branch="$2"
  local sub_key="${3:-}"
  local sub_val="${4:-}"

  if gcloud builds triggers describe "$name" --region=global &>/dev/null; then
    echo "    Trigger exists: $name"
    return
  fi

  local extra_args=()
  if [[ -n "$sub_key" && -n "$sub_val" ]]; then
    extra_args+=(--substitutions="${sub_key}=${sub_val}")
  fi

  gcloud builds triggers create github \
    --name="$name" \
    --region=global \
    --repo-name="$GITHUB_REPO" \
    --repo-owner="$GITHUB_OWNER" \
    --branch-pattern="^${branch}$" \
    --build-config="cloudbuild.yaml" \
    "${extra_args[@]}"

  echo "    Created trigger: $name (branch: $branch)"
}

echo "==> Creating Cloud Build triggers..."
create_trigger "devassets-deploy-backend" "backend"
create_trigger "devassets-deploy-frontend" "frontend" "_API_URL" "http://localhost:4000"

echo ""
echo "==> Bootstrap complete"
echo ""
echo "Next steps:"
echo "  1. Create Cloud SQL PostgreSQL and update secret devassets-database-url:"
echo "     gcloud secrets versions add devassets-database-url --data-file=-"
echo "  2. Push to backend branch → deploys API to Cloud Run"
echo "  3. Copy API URL, update frontend trigger _API_URL substitution:"
echo "     gcloud builds triggers update devassets-deploy-frontend --region=global \\"
echo "       --update-substitutions=_API_URL=https://YOUR-API-URL"
echo "  4. Push to frontend branch → deploys web to Cloud Run"
echo "  5. Update backend trigger _CORS_ORIGIN with frontend Cloud Run URL"
echo ""
echo "Manual trigger test:"
echo "  gcloud builds triggers run devassets-deploy-backend --branch=backend --region=global"
