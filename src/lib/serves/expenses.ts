import { expenses } from "@/lib/mock-data";
import type { Expense } from "@/types/domain";

let expenseStore = [...expenses];

export async function getExpenses() {
  return expenseStore;
}

export async function putExpense(expense: Expense) {
  const existingIndex = expenseStore.findIndex((item) => item.id === expense.id);

  if (existingIndex >= 0) {
    expenseStore[existingIndex] = expense;
    return expense;
  }

  expenseStore = [expense, ...expenseStore];
  return expense;
}

export async function deleteExpense(id: string) {
  expenseStore = expenseStore.filter((expense) => expense.id !== id);
  return { id };
}
