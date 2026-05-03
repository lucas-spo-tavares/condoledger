"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  getPaymentFormDefaultValues,
  paymentFormSchema,
  type PaymentFormInput,
  type PaymentFormValues
} from "@/lib/schemas/payments/payment-schema";
import type { Payment, PaymentUpsert } from "@/types/domain";

export function usePaymentForm(payment?: Payment | null) {
  return useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment ? toPaymentFormValues(payment) : getPaymentFormDefaultValues()
  });
}

export function toPaymentFormValues(payment: Payment): PaymentFormValues {
  return {
    id: payment.id,
    residentId: payment.residentId,
    month: payment.month,
    amount: payment.amountInCents / 100,
    status: payment.status,
    paidAt: payment.paidAt ?? "",
    proofAttachments: payment.proofAttachments
  };
}

export function toPayment(values: PaymentFormValues): PaymentUpsert {
  return {
    residentId: values.residentId,
    month: values.month,
    amountInCents: Math.round(values.amount * 100),
    status: values.status,
    paidAt: values.paidAt || undefined,
    proofAttachments: values.proofAttachments
  };
}
