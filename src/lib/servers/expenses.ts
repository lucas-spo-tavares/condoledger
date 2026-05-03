import "server-only";

import { expenses } from "@/lib/mock-data";
import type { Expense, ExpenseUpsert } from "@/types/domain";

let expenseStore = [...expenses];

export async function getExpenses(filters?: { month?: string; q?: string }) {
  const search = filters?.q?.trim().toLowerCase();

  return expenseStore
    .filter((expense) => {
      const matchesMonth = filters?.month ? expense.month === filters.month : true;
      const matchesSearch = search
        ? [expense.category, expense.description].some((value) => value.toLowerCase().includes(search))
        : true;

      return matchesMonth && matchesSearch;
    })
    .sort((left, right) => left.category.localeCompare(right.category, "pt-BR", { sensitivity: "base" }));
}

export async function putExpense(expense: ExpenseUpsert) {
  const persistedExpense: Expense = {
    ...expense,
    id: expense.id ?? crypto.randomUUID()
  };
  const existingIndex = expenseStore.findIndex((item) => item.id === persistedExpense.id);

  if (existingIndex >= 0) {
    expenseStore[existingIndex] = persistedExpense;
    return persistedExpense;
  }

  expenseStore = [persistedExpense, ...expenseStore];
  return persistedExpense;
}

export async function deleteExpense(id: string) {
  expenseStore = expenseStore.filter((expense) => expense.id !== id);
  return { id };
}
