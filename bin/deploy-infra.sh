#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/infra/terraform"
PROD_ENV_FILE="$ROOT_DIR/.env.prod"
LAMBDA_ZIP_FILE="$ROOT_DIR/infra/lambda/condoledger-web.zip"
DEPLOY_WEB_APP="${DEPLOY_WEB_APP:-false}"

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

export TF_VAR_aws_region="${TF_VAR_aws_region:-${AWS_REGION:-}}"
export TF_VAR_database_url="${TF_VAR_database_url:-${DATABASE_URL:-}}"
export TF_VAR_direct_database_url="${TF_VAR_direct_database_url:-${DIRECT_DATABASE_URL:-}}"
export TF_VAR_enable_web_app="$DEPLOY_WEB_APP"

if [[ -z "$TF_VAR_aws_region" ]]; then
  echo "AWS_REGION or TF_VAR_aws_region is required in .env.prod."
  exit 1
fi

if [[ "$TF_VAR_enable_web_app" == "true" && -z "$TF_VAR_database_url" ]]; then
  echo "DATABASE_URL or TF_VAR_database_url is required in .env.prod."
  exit 1
fi

if [[ "$TF_VAR_enable_web_app" == "true" && -z "$TF_VAR_direct_database_url" ]]; then
  echo "DIRECT_DATABASE_URL or TF_VAR_direct_database_url is required in .env.prod."
  exit 1
fi

if [[ "$TF_VAR_enable_web_app" == "true" && ! -f "$LAMBDA_ZIP_FILE" ]]; then
  echo "Lambda package was not found at $LAMBDA_ZIP_FILE."
  echo "Run npm run build:lambda before deploying infrastructure."
  exit 1
fi

echo "Initializing Terraform"
terraform -chdir="$TERRAFORM_DIR" init

if [[ "$TF_VAR_enable_web_app" == "true" ]]; then
  echo "Applying Terraform infrastructure and web app"
  terraform -chdir="$TERRAFORM_DIR" apply -auto-approve
else
  echo "Applying base Terraform infrastructure"
  terraform -chdir="$TERRAFORM_DIR" apply -auto-approve \
    -target=aws_s3_bucket.proofs \
    -target=aws_s3_bucket_public_access_block.proofs \
    -target=aws_s3_bucket_server_side_encryption_configuration.proofs \
    -target=aws_cognito_user_pool.main \
    -target=aws_cognito_user_pool_client.web \
    -target=aws_cognito_user_group.admins \
    -target=aws_cognito_user_group.residents
fi

echo "Terraform outputs"
terraform -chdir="$TERRAFORM_DIR" output

echo "Infrastructure deploy finished"
