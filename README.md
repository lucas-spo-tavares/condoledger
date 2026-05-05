# CondoLedger

CondoLedger is a web-based condo management system for monthly dues, manual payment confirmations, proof attachments, shared expenses, and PDF-ready monthly reports.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL with Prisma
- Amazon Cognito with email OTP
- Terraform
- Docker Compose with PostgreSQL

## Local Development

Use Node.js `24.15.0` for this project. If you use `nvm`, run `nvm use` in the repo root.

Install dependencies:

```bash
npm install
```

Start the local PostgreSQL container:

```bash
docker compose up -d
```

The compose file stores PostgreSQL data in a Docker-managed `postgres-data` volume.

Apply migrations and seed the local database:

```bash
npm run db:migrate
npm run db:seed
```

Open Prisma Studio to inspect local data:

```bash
npm run db:studio
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
DATABASE_URL=postgresql://condoledger:condoledger@localhost:5432/condoledger?schema=public
AUTH_MODE=local
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
PROOFS_BUCKET_NAME=
```

Set `AUTH_MODE=local` to skip OTP during local development. Use the default `AUTH_MODE=cognito` to keep the email verification flow.

Next.js loads `.env.local` automatically during `npm run dev`, `npm run build`, and `npm run start`.

Terraform does not read `.env.local` automatically. Use AWS environment variables for credentials and either Terraform defaults, `TF_VAR_*` variables, or a `*.tfvars` file for Terraform inputs.

For production deploys, create a local `.env.prod` file after you have the Neon connection string and the Terraform-managed AWS resources. This repo ignores that file, and `npm run deploy` reads it before building or deploying.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DATABASE_URL=<postgres connection url>
AUTH_MODE=cognito
COGNITO_USER_POOL_ID=<terraform output>
COGNITO_CLIENT_ID=<terraform output>
PROOFS_BUCKET_NAME=<terraform output>
```

## Infrastructure

Terraform lives in `infra/terraform` and provisions:

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

`npm run deploy` loads `.env.prod`, runs typecheck and build, applies Prisma migrations, applies the Terraform-managed AWS infrastructure, and prints Terraform outputs. Deploying the Next.js app itself is handled by Amplify.

## Current Scope

- Admin dashboard
- Resident directory
- Manual payments with proof attachment field
- Expense tracking
- Monthly report screen
- Passwordless Cognito helper functions
- PostgreSQL local development setup

Business rules are documented in `BUSINESS_RULES.md`.

## Application Architecture

Frontend data access follows this flow:

```text
UI -> lib/hooks -> lib/apis -> app/api routes -> lib/servers -> lib/repositories -> Prisma/PostgreSQL or external services
```

- `src/lib/hooks/<domain>`: TanStack Query hooks grouped by feature
- `src/lib/apis`: typed fetch clients for internal API routes
- `src/lib/forms/<domain>`: React Hook Form hooks for each Zod schema
- `src/lib/schemas/<domain>`: Zod validation schemas
- `src/app/api`: Next.js route handlers
- `src/lib/servers`: backend service boundary for business workflows and external integrations
- `src/lib/repositories`: Prisma-backed persistence functions
- `src/lib/db`: database client setup
- `src/components/templates`: page-level Atomic Design templates, including client boundaries
- `src/components/organisms`: larger composed UI sections such as the app shell
- `src/components/ui`: shadcn/ui primitives used by the Atomic Design layers

The current services persist data in PostgreSQL through Prisma. Seed data for local testing lives in `scripts/seed-data.ts` and is loaded by `prisma/seed.ts`.
