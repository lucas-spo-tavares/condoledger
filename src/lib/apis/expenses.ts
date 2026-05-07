import { request } from "@/lib/commons/request";
import { buildMultipartPayload } from "@/lib/apis/attachments";
import type { Expense, ExpenseListItem, ExpenseUpsert } from "@/types/domain";

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
  return request<ExpenseListItem[]>(queryString ? `/api/expenses?${queryString}` : "/api/expenses");
}

export async function getExpense(id: string) {
  return request<Expense>(`/api/expenses?id=${encodeURIComponent(id)}`);
}

export async function putExpense(expense: ExpenseUpsert) {
  const body = await buildMultipartPayload(expense, expense.attachments);

  return request<Expense>("/api/expenses", {
    method: "PUT",
    body
  });
}

export async function deleteExpense(id: string) {
  return request<{ id: string }>(`/api/expenses?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
