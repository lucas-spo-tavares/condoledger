import { request } from "@/lib/commons/request";
import type { Expense } from "@/types/domain";

export async function getExpenses() {
  return request<Expense[]>("/api/expenses");
}

export async function putExpense(expense: Expense) {
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
