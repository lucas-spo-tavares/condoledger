"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putExpense } from "@/lib/apis/expenses";

export function useExpensesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] })
  });
}
