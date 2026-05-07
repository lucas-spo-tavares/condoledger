ALTER TABLE "attachments"
ADD COLUMN "file_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN "content_type" TEXT NOT NULL DEFAULT 'application/octet-stream';
