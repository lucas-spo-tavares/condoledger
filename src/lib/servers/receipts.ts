import "server-only";

import {
  deleteReceipt as deleteReceiptRecord,
  findReceiptById,
  findReceipts,
  upsertReceipt
} from "@/lib/repositories/receipts-repository";
import type { ReceiptUpsert } from "@/types/domain";

export async function getReceipts(filters?: { month?: string; q?: string }) {
  return findReceipts(filters);
}

export async function putReceipt(receipt: ReceiptUpsert) {
  return upsertReceipt(receipt);
}

export async function deleteReceipt(id: string) {
  const receipt = await findReceiptById(id);

  if (receipt) {
    await deleteReceiptRecord(id);
  }

  return { id };
}
