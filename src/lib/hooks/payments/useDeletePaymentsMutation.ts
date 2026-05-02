"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePayment } from "@/lib/apis/payments";

export function useDeletePaymentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] })
  });
}
