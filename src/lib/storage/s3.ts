import "server-only";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1"
});

function requireProofsBucketName() {
  const bucketName = process.env.PROOFS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("PROOFS_BUCKET_NAME is required");
  }

  return bucketName;
}

export function isRemoteAttachmentUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function buildAttachmentStorageKey(params: { scope: "receipts" | "expenses"; entityId: string; attachmentId: string }) {
  return `${params.scope}/${params.entityId}/${params.attachmentId}`;
}

export async function uploadAttachmentToS3(params: {
  contentType: string;
  fileName: string;
  storageKey: string;
  file: Blob;
}) {
  const bucket = requireProofsBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.storageKey,
      Body: Buffer.from(await params.file.arrayBuffer()),
      ContentType: params.contentType,
      Metadata: {
        originalFileName: params.fileName
      }
    })
  );

  return params.storageKey;
}

export async function createSignedAttachmentUrl(storageKey: string) {
  if (isRemoteAttachmentUrl(storageKey)) {
    return storageKey;
  }

  const bucket = requireProofsBucketName();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey
    }),
    { expiresIn: 60 * 60 }
  );
}
