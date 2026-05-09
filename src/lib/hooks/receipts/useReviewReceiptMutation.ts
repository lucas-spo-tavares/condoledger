"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reviewReceipt } from "@/lib/apis/receipts";

export function useReviewReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  });
}
