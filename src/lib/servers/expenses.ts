import "server-only";

import { normalizeAttachmentsForPersistence } from "@/lib/servers/attachments";
import {
  deleteExpense as deleteExpenseRecord,
  findExpenseById,
  findExpenses,
  upsertExpense
} from "@/lib/repositories/expenses-repository";
import type { ExpenseUpsert } from "@/types/domain";

export async function getExpenses(filters?: { month?: string; q?: string }) {
  return findExpenses(filters);
}

export async function getExpense(id: string) {
  return findExpenseById(id);
}

export async function putExpense(expense: ExpenseUpsert, formData?: FormData) {
  const expenseId = expense.id ?? crypto.randomUUID();
  const attachments = await normalizeAttachmentsForPersistence({
    attachments: expense.attachments,
    entityId: expenseId,
    formData,
    scope: "expenses"
  });

  return upsertExpense({
    ...expense,
    id: expenseId,
    attachments
  });
}

export async function deleteExpense(id: string) {
  const expense = await findExpenseById(id);

  if (expense) {
    await deleteExpenseRecord(id);
  }

  return { id };
}
