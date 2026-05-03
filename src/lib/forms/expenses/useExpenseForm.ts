"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  expenseFormDefaultValues,
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues
} from "@/lib/schemas/expenses/expense-schema";
import type { Expense } from "@/types/domain";

export function useExpenseForm(expense?: Expense | null) {
  return useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense ? toExpenseFormValues(expense) : expenseFormDefaultValues
  });
}

export function toExpenseFormValues(expense: Expense): ExpenseFormValues {
  return {
    id: expense.id,
    month: expense.month,
    category: expense.category,
    description: expense.description,
    amount: expense.amountInCents / 100,
    paidAt: expense.paidAt,
    attachments: expense.attachments
  };
}

export function toExpense(values: ExpenseFormValues): Expense {
  return {
    id: values.id || crypto.randomUUID(),
    month: values.month,
    category: values.category,
    description: values.description,
    amountInCents: Math.round(values.amount * 100),
    paidAt: values.paidAt,
    attachments: values.attachments
  };
}
