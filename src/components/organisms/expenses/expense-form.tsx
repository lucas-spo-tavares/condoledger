"use client";

import { Controller } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ExpenseFormValues } from "@/lib/schemas/expenses/expense-schema";

export function ExpenseForm() {
  const { control } = useFormContext<ExpenseFormValues>();

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={control}
          name="month"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Mes">
              <DatePicker onValueChange={field.onChange} placeholder="Selecione a data" value={field.value} />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Categoria">
              <Input {...field} placeholder="Seguranca" />
            </FormField>
          )}
        />
        <Controller
          control={control}
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
          control={control}
          name="paidAt"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Pago em">
              <DatePicker onValueChange={field.onChange} value={field.value} />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <div className="md:col-span-2">
              <FormField error={fieldState.error?.message} label="Descricao">
                <Textarea {...field} placeholder="Servico de ronda noturna" />
              </FormField>
            </div>
          )}
        />
      </div>
    </div>
  );
}
