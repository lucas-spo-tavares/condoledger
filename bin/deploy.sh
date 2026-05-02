#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/infra/terraform"

echo "Running checks"
npm run typecheck
npm run build

echo "Applying Terraform"
terraform -chdir="$TERRAFORM_DIR" init
terraform -chdir="$TERRAFORM_DIR" plan -out=tfplan
terraform -chdir="$TERRAFORM_DIR" apply tfplan

echo "Terraform outputs"
terraform -chdir="$TERRAFORM_DIR" output

echo "Deploy preparation finished"
