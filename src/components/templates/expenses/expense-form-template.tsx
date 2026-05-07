"use client";

import { FormProvider } from "react-hook-form";

import { AttachmentFilesCard } from "@/components/organisms/attachment-files-card";
import { ExpenseForm } from "@/components/organisms/expenses/expense-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toExpense, useExpenseForm } from "@/lib/forms/expenses/useExpenseForm";
import { useExpensesMutation } from "@/lib/hooks/expenses/useExpensesMutation";
import { useSafeBackNavigation } from "@/lib/navigation/safe-back";
import { getExpenseFormDefaultValues } from "@/lib/schemas/expenses/expense-schema";
import type { Expense } from "@/types/domain";
import type { ExpenseUpsert } from "@/types/domain";

type ExpenseFormTemplateProps = {
  expense?: Expense | null;
};

export function ExpenseFormTemplate({ expense = null }: ExpenseFormTemplateProps) {
  const goBack = useSafeBackNavigation("/expenses");
  const expensesMutation = useExpensesMutation();
  const form = useExpenseForm(expense);
  const isEditing = Boolean(expense);

  function handleCancel() {
    goBack();
  }

  function handleSubmit(nextExpense: ExpenseUpsert) {
    expensesMutation.mutate(nextExpense, {
      onSuccess: () => goBack()
    });
  }

  function handleSubmitAndAddNew(nextExpense: ExpenseUpsert) {
    expensesMutation.mutate(nextExpense, {
      onSuccess: () => form.reset(getExpenseFormDefaultValues())
    });
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div>
            <p className="text-sm text-muted-foreground">Operacao do condominio</p>
            <h1 className="text-2xl font-semibold tracking-normal">{isEditing ? "Editar despesa" : "Nova despesa"}</h1>
          </div>
          <form className="grid gap-5" onSubmit={form.handleSubmit((values) => handleSubmit(toExpense(values)))}>
            <Card>
              <CardHeader>
                <CardTitle>Dados da despesa</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Atualize os dados da despesa selecionada."
                    : "Registre uma despesa mensal do condominio."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseForm />
              </CardContent>
            </Card>
            <AttachmentFilesCard
              control={form.control}
              description="Adicione comprovantes, PDFs e fotos em um mesmo lugar."
              emptyLabel="Nenhum arquivo anexado ainda. Use 'Adicionar arquivos' para incluir PDFs, JPGs ou PNGs."
              name="attachments"
              setValue={form.setValue}
              title="Arquivos da despesa"
            />
            <div className="flex justify-end gap-2">
              <Button disabled={expensesMutation.isPending} onClick={handleCancel} type="button" variant="outline">
                Cancelar
              </Button>
              {!isEditing ? (
                <Button
                  disabled={expensesMutation.isPending}
                  onClick={form.handleSubmit((values) => handleSubmitAndAddNew(toExpense(values)))}
                  type="button"
                  variant="secondary"
                >
                  Salvar e adicionar novo
                </Button>
              ) : null}
              <Button disabled={expensesMutation.isPending} type="submit">
                Salvar despesa
              </Button>
            </div>
          </form>
      </div>
    </FormProvider>
  );
}
