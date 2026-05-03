#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/infra/terraform"

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but was not found."
  exit 1
fi

echo "This will destroy all Terraform-managed CondoLedger infrastructure in $TERRAFORM_DIR."
read -r -p "Type 'destroy-condoledger' to continue: " CONFIRM

if [[ "$CONFIRM" != "destroy-condoledger" ]]; then
  echo "Destroy cancelled."
  exit 0
fi

terraform -chdir="$TERRAFORM_DIR" init
terraform -chdir="$TERRAFORM_DIR" destroy
