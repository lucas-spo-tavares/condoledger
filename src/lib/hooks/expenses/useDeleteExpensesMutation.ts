"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteExpense } from "@/lib/apis/expenses";

export function useDeleteExpensesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] })
  });
}
