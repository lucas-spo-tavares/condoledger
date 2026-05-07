"use client";

import { useQuery } from "@tanstack/react-query";

import { getExpense } from "@/lib/apis/expenses";

export function useExpenseQuery(id?: string | null) {
  return useQuery({
    queryKey: ["expense", id ?? ""],
    queryFn: () => {
      if (!id) {
        throw new Error("expense id is required");
      }

      return getExpense(id);
    },
    enabled: Boolean(id)
  });
}
