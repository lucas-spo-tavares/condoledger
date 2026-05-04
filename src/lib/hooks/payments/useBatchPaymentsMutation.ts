"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putReceipt } from "@/lib/apis/payments";
import type { ReceiptUpsert } from "@/types/domain";

export function useBatchReceiptsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receipts: ReceiptUpsert[]) => Promise.all(receipts.map((receipt) => putReceipt(receipt))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["receipts"] })
  });
}
