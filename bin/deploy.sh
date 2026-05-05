#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/infra/terraform"
PROD_ENV_FILE="$ROOT_DIR/.env.prod"

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

echo "Running checks and build"
npm run db:generate
npm run typecheck

echo "Initializing Terraform"
terraform -chdir="$TERRAFORM_DIR" init

npm run build

echo "Applying Prisma migrations"
npm run db:deploy

echo "Applying Terraform infrastructure"
terraform -chdir="$TERRAFORM_DIR" apply -auto-approve

echo "Terraform outputs"
terraform -chdir="$TERRAFORM_DIR" output

echo "Deploy finished"
