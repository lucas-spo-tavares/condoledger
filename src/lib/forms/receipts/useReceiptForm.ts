"use client";

import * as React from "react";
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
  const form = useForm<ReceiptFormInput, unknown, ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: receipt ? toReceiptFormValues(receipt) : getReceiptFormDefaultValues()
  });

  React.useEffect(() => {
    if (receipt) {
      form.reset(toReceiptFormValues(receipt));
    }
  }, [form, receipt]);

  return form;
}

export function toReceiptFormValues(receipt: Receipt): ReceiptFormValues {
  return {
    id: receipt.id,
    residentId: receipt.residentId,
    month: receipt.month,
    description: receipt.description ?? "",
    amount: receipt.amountInCents / 100,
    receivedAt: receipt.receivedAt,
    proofAttachments: receipt.proofAttachments
  };
}

export function toReceipt(values: ReceiptFormValues): ReceiptUpsert {
  return {
    id: values.id,
    residentId: values.residentId,
    month: values.month,
    description: values.description?.trim() || undefined,
    amountInCents: Math.round(values.amount * 100),
    receivedAt: values.receivedAt,
    proofAttachments: values.proofAttachments
  };
}
