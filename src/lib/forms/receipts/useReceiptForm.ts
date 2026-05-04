"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  getReceiptFormDefaultValues,
  receiptFormSchema,
  type ReceiptFormInput,
  type ReceiptFormValues
} from "@/lib/schemas/receipts/receipt-schema";
import type { Receipt, ReceiptUpsert } from "@/types/domain";

export function useReceiptForm(receipt?: Receipt | null) {
  return useForm<ReceiptFormInput, unknown, ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: receipt ? toReceiptFormValues(receipt) : getReceiptFormDefaultValues()
  });
}

export function toReceiptFormValues(receipt: Receipt): ReceiptFormValues {
  return {
    id: receipt.id,
    residentId: receipt.residentId,
    month: receipt.month,
    description: receipt.description ?? "",
    amount: receipt.amountInCents / 100,
    status: receipt.status,
    paidAt: receipt.paidAt ?? "",
    proofAttachments: receipt.proofAttachments
  };
}

export function toReceipt(values: ReceiptFormValues): ReceiptUpsert {
  return {
    residentId: values.residentId,
    month: values.month,
    description: values.description?.trim() || undefined,
    amountInCents: Math.round(values.amount * 100),
    status: values.status,
    paidAt: values.paidAt || undefined,
    proofAttachments: values.proofAttachments
  };
}
