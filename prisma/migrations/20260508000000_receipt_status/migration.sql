CREATE TYPE "receipt_status" AS ENUM ('pending', 'confirmed', 'rejected');

ALTER TABLE "receipts"
ADD COLUMN "status" "receipt_status" NOT NULL DEFAULT 'confirmed',
ADD COLUMN "reviewed_at" TIMESTAMPTZ(6),
ADD COLUMN "review_note" TEXT;

CREATE INDEX "receipts_status_idx" ON "receipts"("status");
