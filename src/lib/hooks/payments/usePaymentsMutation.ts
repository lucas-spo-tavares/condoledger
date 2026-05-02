"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putPayment } from "@/lib/apis/payments";

export function usePaymentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putPayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] })
  });
}
