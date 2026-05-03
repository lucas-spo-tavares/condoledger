"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putPayment } from "@/lib/apis/payments";
import type { PaymentUpsert } from "@/types/domain";

export function useBatchPaymentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payments: PaymentUpsert[]) => Promise.all(payments.map((payment) => putPayment(payment))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] })
  });
}
