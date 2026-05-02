"use client";

import { Controller } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { toExpense, useExpenseForm } from "@/lib/forms/expenses/useExpenseForm";
import type { Expense } from "@/types/domain";

type ExpenseFormProps = {
  expense?: Expense | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (expense: Expense) => void;
};

export function ExpenseForm({ expense, isSubmitting = false, onCancel, onSubmit }: ExpenseFormProps) {
  const form = useExpenseForm(expense);

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(toExpense(values)))}>
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={form.control}
          name="month"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Mes">
              <DatePicker onValueChange={field.onChange} placeholder="Selecione a data" value={field.value} />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Categoria">
              <Input {...field} placeholder="Seguranca" />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Descricao">
              <Input {...field} placeholder="Servico de ronda noturna" />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Valor">
              <CurrencyInput
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                ref={field.ref}
                value={typeof field.value === "number" ? field.value : 0}
              />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="paidAt"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Pago em">
              <DatePicker onValueChange={field.onChange} value={field.value} />
            </FormField>
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          Salvar despesa
        </Button>
      </div>
    </form>
  );
}
