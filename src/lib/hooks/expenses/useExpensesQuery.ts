"use client";

import { useQuery } from "@tanstack/react-query";

import { getExpenses, type ExpenseQueryParams } from "@/lib/apis/expenses";

export function useExpensesQuery(params?: ExpenseQueryParams) {
  return useQuery({
    queryKey: ["expenses", params?.month ?? "", params?.q ?? ""],
    queryFn: () => getExpenses(params)
  });
}
