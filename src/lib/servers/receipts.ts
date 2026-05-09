import "server-only";

import { normalizeAttachmentsForPersistence } from "@/lib/servers/attachments";
import {
  deleteReceipt as deleteReceiptRecord,
  findReceiptById,
  findReceipts,
  type ReceiptFilters,
  updateReceiptReview,
  upsertReceipt
} from "@/lib/repositories/receipts-repository";
import type { ReceiptStatus, ReceiptUpsert } from "@/types/domain";

export async function getReceipts(filters?: ReceiptFilters) {
  return findReceipts(filters);
}

export async function getReceipt(id: string) {
  return findReceiptById(id);
}

export async function putReceipt(receipt: ReceiptUpsert, formData?: FormData) {
  const receiptId = receipt.id ?? crypto.randomUUID();
  const proofAttachments = await normalizeAttachmentsForPersistence({
    attachments: receipt.proofAttachments,
    entityId: receiptId,
    formData,
    scope: "receipts"
  });

  return upsertReceipt({
    ...receipt,
    id: receiptId,
    proofAttachments
  });
}

export async function deleteReceipt(id: string) {
  const receipt = await findReceiptById(id);

  if (receipt) {
    await deleteReceiptRecord(id);
  }

  return { id };
}

export async function reviewReceipt(id: string, status: Exclude<ReceiptStatus, "pending">, reviewNote?: string) {
  return updateReceiptReview({ id, status, reviewNote });
}
