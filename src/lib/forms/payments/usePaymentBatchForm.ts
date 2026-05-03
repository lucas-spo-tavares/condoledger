"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  paymentBatchFormSchema,
  type PaymentBatchFormInput,
  type PaymentBatchFormValues
} from "@/lib/schemas/payments/payment-batch-schema";

export function usePaymentBatchForm(defaultValues: PaymentBatchFormValues) {
  return useForm<PaymentBatchFormInput, unknown, PaymentBatchFormValues>({
    resolver: zodResolver(paymentBatchFormSchema),
    defaultValues
  });
}
