"use client";

import { useQuery } from "@tanstack/react-query";

import { getExpenses } from "@/lib/apis/expenses";

export function useExpensesQuery() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses
  });
}
