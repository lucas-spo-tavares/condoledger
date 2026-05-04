"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putReceipt } from "@/lib/apis/receipts";

export function useReceiptsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putReceipt,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["receipts"] })
  });
}
