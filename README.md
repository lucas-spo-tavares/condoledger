# CondoLedger

CondoLedger is a web-based condo management system for monthly dues, manual payment confirmations, proof attachments, shared expenses, and PDF-ready monthly reports.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Amazon DynamoDB
- Amazon Cognito with email OTP
- Terraform
- Docker Compose with Amazon DynamoDB Local

## Local Development

Use Node.js `24.15.0` for this project. If you use `nvm`, run `nvm use` in the repo root.

Install dependencies:

```bash
npm install
```

Start the local DynamoDB container:

```bash
docker compose up -d
```

The compose file stores DynamoDB Local data in `./.dynamodb`, so the container can write its SQLite files without relying on a Docker-managed named volume.

Seed the local table:

```bash
npm run dynamodb:seed
```

Clear all local DynamoDB data:

```bash
npm run dynamodb:clear
```

Open a simple browser UI to inspect the local tables:

```bash
npm run dynamodb:admin
```

Start the app:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill the Cognito values after applying Terraform.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_TABLE_NAME=condoledger-local
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_GSI1_NAME=GSI1
AUTH_MODE=local
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
PROOFS_BUCKET_NAME=
```

Set `AUTH_MODE=local` to skip OTP during local development. Use the default `AUTH_MODE=cognito` to keep the email verification flow.

Next.js loads `.env.local` automatically during `npm run dev`, `npm run build`, and `npm run start`.

Terraform does not read `.env.local` automatically. Use AWS environment variables for credentials and either Terraform defaults, `TF_VAR_*` variables, or a `*.tfvars` file for Terraform inputs.

For production deploys, create a local `.env.prod` file after Terraform has been applied. This repo ignores that file, and `npm run deploy` reads it before building or deploying.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=<terraform output>
DYNAMODB_ENDPOINT=
DYNAMODB_GSI1_NAME=GSI1
AUTH_MODE=cognito
COGNITO_USER_POOL_ID=<terraform output>
COGNITO_CLIENT_ID=<terraform output>
PROOFS_BUCKET_NAME=<terraform output>
```

## Infrastructure

Terraform lives in `infra/terraform` and provisions:

- DynamoDB single-table storage
- S3 bucket for payment proofs
- Cognito User Pool
- Cognito web app client
- Cognito groups for admins and residents

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

For the manual deploy flow:

```bash
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform apply
npm run deploy
```

`npm run deploy` loads `.env.prod`, runs typecheck and build, reads the existing Terraform outputs, uploads the static frontend when `out/` exists, and prints Terraform outputs.

## Current Scope

- Admin dashboard
- Resident directory
- Manual payments with proof attachment field
- Expense tracking
- Monthly report screen
- Passwordless Cognito helper functions
- Amazon DynamoDB Local container testing setup

Business rules are documented in `BUSINESS_RULES.md`.

## Application Architecture

Frontend data access follows this flow:

```text
UI -> lib/hooks -> lib/apis -> app/api routes -> lib/servers -> DynamoDB or external services
```

- `src/lib/hooks/<domain>`: TanStack Query hooks grouped by feature
- `src/lib/apis`: typed fetch clients for internal API routes
- `src/lib/forms/<domain>`: React Hook Form hooks for each Zod schema
- `src/lib/schemas/<domain>`: Zod validation schemas
- `src/app/api`: Next.js route handlers
- `src/lib/servers`: backend service boundary for DynamoDB and external integrations
- `src/components/templates`: page-level Atomic Design templates, including client boundaries
- `src/components/organisms`: larger composed UI sections such as the app shell
- `src/components/ui`: shadcn/ui primitives used by the Atomic Design layers

The current services persist data in DynamoDB. Seed data for local testing lives in `scripts/seed-data.ts`.
