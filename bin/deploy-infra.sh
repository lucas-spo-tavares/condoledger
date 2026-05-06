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
  echo ".env.prod is required for infrastructure deploys but was not found at $PROD_ENV_FILE."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$PROD_ENV_FILE"
set +a

export TF_VAR_database_url="${TF_VAR_database_url:-${DATABASE_URL:-}}"
export TF_VAR_direct_database_url="${TF_VAR_direct_database_url:-${DIRECT_DATABASE_URL:-}}"

if [[ -z "$TF_VAR_database_url" ]]; then
  echo "DATABASE_URL or TF_VAR_database_url is required in .env.prod."
  exit 1
fi

if [[ -z "$TF_VAR_direct_database_url" ]]; then
  echo "DIRECT_DATABASE_URL or TF_VAR_direct_database_url is required in .env.prod."
  exit 1
fi

echo "Initializing Terraform"
terraform -chdir="$TERRAFORM_DIR" init

echo "Applying Terraform infrastructure"
terraform -chdir="$TERRAFORM_DIR" apply -auto-approve

echo "Terraform outputs"
terraform -chdir="$TERRAFORM_DIR" output

echo "Infrastructure deploy finished"
