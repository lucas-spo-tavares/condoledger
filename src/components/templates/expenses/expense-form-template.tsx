"use client";

import { useRouter } from "next/navigation";

import { AppShell } from "@/components/organisms/app-shell";
import { ExpenseForm } from "@/components/organisms/expenses/expense-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpensesMutation } from "@/lib/hooks/expenses/useExpensesMutation";
import { useExpensesQuery } from "@/lib/hooks/expenses/useExpensesQuery";
import type { Expense } from "@/types/domain";

type ExpenseFormTemplateProps = {
  expenseId?: string | null;
};

export function ExpenseFormTemplate({ expenseId = null }: ExpenseFormTemplateProps) {
  const router = useRouter();
  const expensesQuery = useExpensesQuery();
  const expensesMutation = useExpensesMutation();
  const expense = expenseId ? expensesQuery.data?.find((item) => item.id === expenseId) ?? null : null;
  const isEditing = Boolean(expenseId);
  const isMissingExpense = Boolean(expenseId) && expensesQuery.isSuccess && !expense;

  function handleCancel() {
    router.push("/expenses");
  }

  function handleSubmit(nextExpense: Expense) {
    expensesMutation.mutate(nextExpense, {
      onSuccess: () => router.push("/expenses")
    });
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <div>
          <p className="text-sm text-muted-foreground">Operacao do condominio</p>
          <h1 className="text-2xl font-semibold tracking-normal">{isEditing ? "Editar despesa" : "Nova despesa"}</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Dados da despesa</CardTitle>
            <CardDescription>
              {isEditing ? "Atualize os dados da despesa selecionada." : "Registre uma despesa mensal do condominio."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMissingExpense ? (
              <p className="text-sm text-muted-foreground">Despesa nao encontrada.</p>
            ) : (
              <ExpenseForm
                expense={expense}
                isSubmitting={expensesMutation.isPending}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
