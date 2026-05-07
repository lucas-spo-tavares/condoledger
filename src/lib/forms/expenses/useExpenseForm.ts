"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  getExpenseFormDefaultValues,
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues
} from "@/lib/schemas/expenses/expense-schema";
import type { Expense, ExpenseUpsert } from "@/types/domain";

export function useExpenseForm(expense?: Expense | null) {
  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense ? toExpenseFormValues(expense) : getExpenseFormDefaultValues()
  });

  React.useEffect(() => {
    if (expense) {
      form.reset(toExpenseFormValues(expense));
    }
  }, [expense, form]);

  return form;
}

export function toExpenseFormValues(expense: Expense): ExpenseFormValues {
  return {
    id: expense.id,
    category: expense.category,
    description: expense.description,
    amount: expense.amountInCents / 100,
    paidAt: expense.paidAt,
    attachments: expense.attachments
  };
}

export function toExpense(values: ExpenseFormValues): ExpenseUpsert {
  return {
    category: values.category,
    description: values.description,
    amountInCents: Math.round(values.amount * 100),
    paidAt: values.paidAt,
    attachments: values.attachments
  };
}
