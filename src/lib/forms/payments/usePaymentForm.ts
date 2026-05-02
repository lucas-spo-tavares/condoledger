"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  paymentFormDefaultValues,
  paymentFormSchema,
  type PaymentFormInput,
  type PaymentFormValues
} from "@/lib/schemas/payments/payment-schema";
import type { Payment } from "@/types/domain";

export function usePaymentForm(payment?: Payment | null) {
  return useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment ? toPaymentFormValues(payment) : paymentFormDefaultValues
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
    proofKey: payment.proofKey ?? ""
  };
}

export function toPayment(values: PaymentFormValues): Payment {
  return {
    id: values.id || crypto.randomUUID(),
    residentId: values.residentId,
    month: values.month,
    amountInCents: Math.round(values.amount * 100),
    status: values.status,
    paidAt: values.paidAt || undefined,
    proofKey: values.proofKey || undefined
  };
}
