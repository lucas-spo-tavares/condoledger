import { request } from "@/lib/commons/request";
import type { Expense, ExpenseUpsert } from "@/types/domain";

export type ExpenseQueryParams = {
  month?: string;
  q?: string;
};

export async function getExpenses(params?: ExpenseQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.month) {
    searchParams.set("month", params.month);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  const queryString = searchParams.toString();
  return request<Expense[]>(queryString ? `/api/expenses?${queryString}` : "/api/expenses");
}

export async function putExpense(expense: ExpenseUpsert) {
  return request<Expense>("/api/expenses", {
    method: "PUT",
    body: JSON.stringify(expense)
  });
}

export async function deleteExpense(id: string) {
  return request<{ id: string }>(`/api/expenses?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
