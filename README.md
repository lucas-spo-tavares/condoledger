# CondoLedger

CondoLedger is a web-based condo management system for monthly dues, manual payment confirmations, proof attachments, shared expenses, and PDF-ready monthly reports.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL with Prisma
- Amazon Cognito with email OTP
- AWS Lambda Web Adapter for standalone Next.js deployment
- Amazon CloudFront as the public web entrypoint
- Terraform
- Docker Compose with PostgreSQL

## Local Development

Use Node.js `22.16.0` for this project. If you use `nvm`, run `nvm use` in the repo root.

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

The `npm run dev` command runs Prisma migrations first through the `predev` script, then starts Next.js.

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

For production deploys, create a local `.env.prod` file after you have the Neon connection string. This repo ignores that file, and `npm run deploy` reads it before building or deploying.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DATABASE_URL=<postgres connection url, preferably with sslmode=verify-full>
DIRECT_DATABASE_URL=<direct postgres connection url, preferably with sslmode=verify-full>
AUTH_MODE=cognito
```

If you intentionally want libpq-style SSL semantics instead of the current safer default, use `uselibpqcompat=true&sslmode=require`.

`bin/deploy.sh` maps `AWS_REGION`, `DATABASE_URL`, and `DIRECT_DATABASE_URL` from `.env.prod` to the Terraform `TF_VAR_*` inputs automatically, so you do not need to duplicate those values. Cognito and S3 runtime values are injected into the Lambda by Terraform.

## Infrastructure

Terraform lives in `infra/terraform` and provisions:

- S3 bucket for payment proofs
- Cognito User Pool
- Cognito web app client
- Cognito groups for admins and residents
- Lambda function running the Next.js standalone server
- Lambda Function URL used as the CloudFront origin
- CloudFront distribution for the public web entrypoint

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

`npm run deploy` loads `.env.prod`, runs typecheck, builds the Next.js standalone Lambda package, applies Prisma migrations, applies the Terraform-managed AWS infrastructure, and prints Terraform outputs.

The Lambda package is generated at `infra/lambda/condoledger-web.zip` from `.next/standalone`, `.next/static`, and `public`. If you only need to rebuild the package, run:

```bash
npm run build:lambda
```

If you only want the base AWS infrastructure, run:

```bash
npm run deploy:infra
```

`npm run deploy:infra` provisions the shared AWS resources only, such as S3 and Cognito. It does not deploy the Next.js Lambda or CloudFront distribution. Use `npm run deploy` when you want to deploy the full web application.

To backfill Cognito users for residents who already have e-mail addresses, run:

```bash
npm run cognito:sync-residents
```

That script scans residents with e-mail and creates or updates the matching Cognito users.

Residents with e-mail are also synced to Cognito automatically when they are created or updated, and users that exist only in Cognito can sign in if their e-mail is registered there.

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
