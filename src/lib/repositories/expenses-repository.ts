import "server-only";

import { prisma } from "@/lib/db/prisma";
import { mapExpense, toMonthDate, toTimestamp } from "@/lib/repositories/mappers";
import type { ExpenseUpsert } from "@/types/domain";

const expenseInclude = {
  attachments: true
};

export async function findExpenses(filters?: { month?: string; q?: string }) {
  const search = filters?.q?.trim();
  const expenses = await prisma.expense.findMany({
    include: expenseInclude,
    where: {
      month: filters?.month ? toMonthDate(filters.month) : undefined,
      ...(search
        ? {
            OR: [
              {
                category: {
                  contains: search,
                  mode: "insensitive"
                } as const
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive"
                } as const
              }
            ]
          }
        : {})
    },
    orderBy: {
      category: "asc"
    }
  });

  return expenses.map(mapExpense);
}

export async function findExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({
    include: expenseInclude,
    where: { id }
  });

  return expense ? mapExpense(expense) : null;
}

export async function upsertExpense(expense: ExpenseUpsert) {
  const paidAt = toTimestamp(expense.paidAt);
  const month = toMonthDate(expense.paidAt);
  const persistedExpense = await prisma.expense.upsert({
    include: expenseInclude,
    where: {
      id: expense.id ?? "00000000-0000-0000-0000-000000000000"
    },
    create: {
      category: expense.category,
      description: expense.description,
      amountInCents: expense.amountInCents,
      paidAt,
      month,
      attachments: {
        create: expense.attachments.map((attachment) => ({
          id: attachment.id,
          previewUrl: attachment.previewUrl
        }))
      }
    },
    update: {
      category: expense.category,
      description: expense.description,
      amountInCents: expense.amountInCents,
      paidAt,
      month,
      attachments: {
        deleteMany: {},
        create: expense.attachments.map((attachment) => ({
          id: attachment.id,
          previewUrl: attachment.previewUrl
        }))
      }
    }
  });

  return mapExpense(persistedExpense);
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({
    where: { id }
  });
}
