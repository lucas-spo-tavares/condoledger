"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  receiptBatchFormSchema,
  type ReceiptBatchFormInput,
  type ReceiptBatchFormValues
} from "@/lib/schemas/receipts/receipt-batch-schema";

export function useReceiptBatchForm(defaultValues: ReceiptBatchFormValues) {
  return useForm<ReceiptBatchFormInput, unknown, ReceiptBatchFormValues>({
    resolver: zodResolver(receiptBatchFormSchema),
    defaultValues
  });
}
