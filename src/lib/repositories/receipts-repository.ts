import "server-only";

import { mapReceipt, mapReceiptListItem } from "@/lib/mappers/receipts";
import { toMonthDate, toTimestamp } from "@/lib/mappers/dates";
import { prisma } from "@/lib/db/prisma";
import type { ReceiptUpsert } from "@/types/domain";

const receiptInclude = {
  attachments: true,
  resident: true
};

const receiptListInclude = {
  _count: {
    select: {
      attachments: true
    }
  },
  resident: true
};

export async function findReceipts(filters?: { month?: string; q?: string }) {
  const receipts = await prisma.receipt.findMany({
    include: receiptListInclude,
    where: {
      month: filters?.month ? toMonthDate(filters.month) : undefined,
      ...(filters?.q
        ? {
            resident: {
              name: {
                contains: filters.q.trim(),
                mode: "insensitive"
              } as const
            }
          }
        : {})
    }
  });

  return receipts
    .sort((left, right) => left.resident.name.localeCompare(right.resident.name, "pt-BR", { sensitivity: "base" }))
    .map(mapReceiptListItem);
}

export async function findReceiptById(id: string) {
  const receipt = await prisma.receipt.findUnique({
    include: receiptInclude,
    where: { id }
  });

  return receipt ? mapReceipt(receipt) : null;
}

export async function upsertReceipt(receipt: ReceiptUpsert) {
  const persistedReceipt = await prisma.$transaction(async (transaction) => {
    const receiptId = receipt.id ?? crypto.randomUUID();

    const persisted = await transaction.receipt.upsert({
      include: receiptInclude,
      where: {
        id: receiptId
      },
      create: {
        id: receiptId,
        residentId: receipt.residentId,
        month: toMonthDate(receipt.month),
        description: receipt.description ?? null,
        amountInCents: receipt.amountInCents,
        receivedAt: toTimestamp(receipt.receivedAt),
        attachments: {
          create: receipt.proofAttachments.map((attachment) => ({
            id: attachment.id,
            previewUrl: attachment.storageKey ?? attachment.previewUrl,
            fileName: attachment.name,
            contentType: attachment.type
          }))
        }
      },
      update: {
        residentId: receipt.residentId,
        month: toMonthDate(receipt.month),
        description: receipt.description ?? null,
        amountInCents: receipt.amountInCents,
        receivedAt: toTimestamp(receipt.receivedAt),
        attachments: {
          deleteMany: {},
          create: receipt.proofAttachments.map((attachment) => ({
            id: attachment.id,
            previewUrl: attachment.storageKey ?? attachment.previewUrl,
            fileName: attachment.name,
            contentType: attachment.type
          }))
        }
      }
    });

    return persisted;
  });

  return mapReceipt(persistedReceipt);
}

export async function deleteReceipt(id: string) {
  await prisma.receipt.delete({
    where: { id }
  });
}
