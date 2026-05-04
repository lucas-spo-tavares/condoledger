"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteReceipt } from "@/lib/apis/receipts";

export function useDeleteReceiptsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["receipts"] })
  });
}
