"use client";

import { Controller } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import type { ReceiptFormValues } from "@/lib/schemas/payments/payment-schema";
import type { Resident } from "@/types/domain";

type ReceiptFormProps = {
  residents: Resident[];
};

export function ReceiptForm({ residents }: ReceiptFormProps) {
  const { control, setValue } = useFormContext<ReceiptFormValues>();

  function handleResidentChange(residentId: string, onChange: (value: string) => void) {
    onChange(residentId);

    const resident = residents.find((item) => item.id === residentId);
    const nextAmount = resident ? resident.monthlyContributionInCents / 100 : 0;

    setValue("amount", nextAmount, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={control}
          name="residentId"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Morador">
              <select
                {...field}
                onChange={(event) => handleResidentChange(event.target.value, field.onChange)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name} | {resident.unit}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="month"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Mes">
              <MonthPicker
                onValueChange={field.onChange}
                placeholder="Selecione o mes"
                value={field.value}
              />
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
          name="status"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Status">
              <select
                {...field}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="voided">Cancelado</option>
              </select>
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="paidAt"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Pago em">
              <DatePicker onValueChange={field.onChange} value={field.value ?? ""} />
            </FormField>
          )}
        />
      </div>
    </div>
  );
}
