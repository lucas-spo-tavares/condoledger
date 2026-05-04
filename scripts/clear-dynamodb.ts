import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { loadEnvConfig } from "@next/env";

type DynamoKey = {
  PK: string;
  SK: string;
};

type ScannedItem = DynamoKey & {
  attachments?: unknown;
  proofAttachments?: unknown;
} & Record<string, unknown>;
type AttachmentLike = {
  previewUrl?: unknown;
};

async function main() {
  loadEnvConfig(process.cwd());
  const { documentClient, tableName } = await import("../src/lib/dynamodb");
  const items = await scanItems();

  await deleteProofFiles(items);
  const keys = items.map(({ PK, SK }) => ({ PK, SK }));

  for (const chunk of chunkItems(keys, 25)) {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((key) => ({
            DeleteRequest: {
              Key: key
            }
          }))
        }
      })
    );
  }

  console.log(`Deleted ${keys.length} items from ${tableName}.`);
}

async function scanItems() {
  const { documentClient, tableName } = await import("../src/lib/dynamodb");
  const items: ScannedItem[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...((response.Items ?? []) as ScannedItem[]));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
}

async function deleteProofFiles(items: ScannedItem[]) {
  const bucketName = process.env.PROOFS_BUCKET_NAME;

  if (!bucketName) {
    console.warn("Skipping S3 cleanup because PROOFS_BUCKET_NAME is not set.");
    return;
  }

  const keys = collectProofKeys(items);

  if (!keys.length) {
    return;
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1"
  });

  for (const chunk of chunkItems(keys, 1000)) {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true
        }
      })
    );
  }

  console.log(`Deleted ${keys.length} files from s3://${bucketName}.`);
}

function collectProofKeys(items: ScannedItem[]) {
  const keys = new Set<string>();

  for (const item of items) {
    addAttachmentKeys(keys, item.proofAttachments);
    addAttachmentKeys(keys, item.attachments);
  }

  return [...keys];
}

function addAttachmentKeys(keys: Set<string>, value: unknown) {
  if (!Array.isArray(value)) {
    return;
  }

  for (const attachment of value) {
    if (!attachment || typeof attachment !== "object") {
      continue;
    }

    const previewUrl = (attachment as AttachmentLike).previewUrl;

    if (typeof previewUrl !== "string") {
      continue;
    }

    const key = previewUrlToS3Key(previewUrl);

    if (key) {
      keys.add(key);
    }
  }
}

function previewUrlToS3Key(previewUrl: string) {
  if (previewUrl.startsWith("blob:") || previewUrl.startsWith("data:")) {
    return null;
  }

  let pathname = previewUrl;

  try {
    pathname = new URL(previewUrl).pathname;
  } catch {
    // Relative URLs like "/proofs/..." are expected in seed data and production records.
  }

  const normalizedPath = pathname.replace(/^\/+/, "");

  return normalizedPath.startsWith("proofs/") ? normalizedPath : null;
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
