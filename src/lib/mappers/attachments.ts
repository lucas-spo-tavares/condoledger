import { createSignedAttachmentUrl, isRemoteAttachmentUrl } from "@/lib/storage/s3";
import type { FileAttachment } from "@/types/domain";

type AttachmentRecord = {
  id: string;
  previewUrl: string;
  fileName: string;
  contentType: string;
  createdAt: Date;
};

export async function mapAttachment(record: AttachmentRecord): Promise<FileAttachment> {
  const storageKey = record.previewUrl;

  return {
    id: record.id,
    name: record.fileName || getFileName(storageKey),
    previewUrl: isRemoteAttachmentUrl(storageKey) ? storageKey : await createSignedAttachmentUrl(storageKey),
    type: getAttachmentType(record.contentType || storageKey),
    storageKey
  };
}

function getFileName(value: string) {
  return value.split("/").pop() || value;
}

function getAttachmentType(value: string): FileAttachment["type"] {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes("pdf")) {
    return "application/pdf";
  }

  if (normalizedValue.includes("png")) {
    return "image/png";
  }

  return "image/jpeg";
}
