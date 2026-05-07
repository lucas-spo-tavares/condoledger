#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROD_ENV_FILE="$ROOT_DIR/.env.prod"
DEPLOY_INFRA_SCRIPT="$ROOT_DIR/bin/deploy-infra.sh"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but was not found."
  exit 1
fi

if [[ ! -f "$PROD_ENV_FILE" ]]; then
  echo ".env.prod is required for production deploys but was not found at $PROD_ENV_FILE."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$PROD_ENV_FILE"
set +a

echo "Running checks"
npm run db:generate
npm run typecheck
npm run cognito:sync-residents
npm run cognito:sync-admins
npm run build:lambda

echo "Applying Prisma migrations"
npm run db:deploy

DEPLOY_WEB_APP=true bash "$DEPLOY_INFRA_SCRIPT"

echo "Deploy finished"
