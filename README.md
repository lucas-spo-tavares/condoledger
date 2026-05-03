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
- Docker Compose with DynamoDB Local

## Local Development

Install dependencies:

```bash
npm install
```

Start DynamoDB Local:

```bash
docker compose up -d
```

Seed the local table:

```bash
npm run dynamodb:seed
```

Start the app:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

DynamoDB Admin runs at `http://localhost:8001`.

## Environment

Copy `.env.example` to `.env.local` and fill the Cognito values after applying Terraform.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_TABLE_NAME=condoledger-local
DYNAMODB_ENDPOINT=http://localhost:8000
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
PROOFS_BUCKET_NAME=
```

Next.js loads `.env.local` automatically during `npm run dev`, `npm run build`, and `npm run start`.

Terraform does not read `.env.local` automatically. Use AWS environment variables for credentials and either Terraform defaults, `TF_VAR_*` variables, or a `*.tfvars` file for Terraform inputs.

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
npm run deploy
```

This runs typecheck, builds the app, initializes Terraform, creates a plan, applies it, and prints Terraform outputs.

## Current Scope

- Admin dashboard
- Resident directory
- Manual payments with proof attachment field
- Expense tracking
- Monthly report screen
- Passwordless Cognito helper functions
- Local DynamoDB testing setup

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

The current services are mocked in memory. They are intentionally isolated behind `lib/servers` so DynamoDB persistence can be added without rewriting the UI or hooks.
