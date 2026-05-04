#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/infra/terraform"
FRONTEND_DIR="$ROOT_DIR/out"
PROD_ENV_FILE="$ROOT_DIR/.env.prod"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but was not found."
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required but was not found."
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
npm run typecheck

echo "Initializing Terraform"
terraform -chdir="$TERRAFORM_DIR" init

npm run build

FRONTEND_BUCKET="$(terraform -chdir="$TERRAFORM_DIR" output -raw frontend_bucket_name)"
if [[ -z "$FRONTEND_BUCKET" ]]; then
  echo "Terraform output frontend_bucket_name is missing. Run terraform apply first."
  exit 1
fi

CLOUDFRONT_DISTRIBUTION_ID="$(terraform -chdir="$TERRAFORM_DIR" output -raw frontend_cloudfront_distribution_id)"
if [[ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
  echo "Terraform output frontend_cloudfront_distribution_id is missing. Run terraform apply first."
  exit 1
fi

if [[ -d "$FRONTEND_DIR" ]]; then
  echo "Uploading static frontend to S3"
  aws s3 sync "$FRONTEND_DIR" "s3://$FRONTEND_BUCKET" --delete

  echo "Invalidating CloudFront cache"
  aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" >/dev/null
else
  echo "Static frontend folder not found at $FRONTEND_DIR."
  echo "Skipping S3 upload and CloudFront invalidation."
  echo "If you want static deploy, configure Next to export and generate ./out."
fi

echo "Terraform outputs"
terraform -chdir="$TERRAFORM_DIR" output

echo "Deploy finished"
