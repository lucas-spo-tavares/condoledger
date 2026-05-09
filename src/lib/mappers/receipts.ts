import type { Receipt, ReceiptListItem } from "@/types/domain";

import { mapAttachment } from "@/lib/mappers/attachments";
import { toDateOnlyString } from "@/lib/mappers/dates";

type AttachmentRecord = {
  id: string;
  previewUrl: string;
  fileName: string;
  contentType: string;
  createdAt: Date;
};

type ReceiptRecord = {
  id: string;
  residentId: string;
  month: Date;
  description: string | null;
  amountInCents: number;
  receivedAt: Date;
  status: "pending" | "confirmed" | "rejected";
  reviewedAt: Date | null;
  reviewNote: string | null;
  attachments: AttachmentRecord[];
};

type ReceiptSummaryRecord = {
  id: string;
  residentId: string;
  month: Date;
  description: string | null;
  amountInCents: number;
  receivedAt: Date;
  status: "pending" | "confirmed" | "rejected";
  reviewedAt: Date | null;
  reviewNote: string | null;
  _count: {
    attachments: number;
  };
};

export async function mapReceipt(record: ReceiptRecord): Promise<Receipt> {
  const proofAttachments = await Promise.all(record.attachments.map(mapAttachment));

  return {
    id: record.id,
    residentId: record.residentId,
    month: toDateOnlyString(record.month),
    description: record.description ?? undefined,
    amountInCents: record.amountInCents,
    receivedAt: record.receivedAt.toISOString(),
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewNote: record.reviewNote ?? undefined,
    proofAttachments
  };
}

export function mapReceiptListItem(record: ReceiptSummaryRecord): ReceiptListItem {
  return {
    id: record.id,
    residentId: record.residentId,
    month: toDateOnlyString(record.month),
    description: record.description ?? undefined,
    amountInCents: record.amountInCents,
    receivedAt: record.receivedAt.toISOString(),
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString(),
    reviewNote: record.reviewNote ?? undefined,
    proofAttachmentCount: record._count.attachments
  };
}
