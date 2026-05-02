"use client";

import { Controller } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { toPayment, usePaymentForm } from "@/lib/forms/payments/usePaymentForm";
import type { Payment, Resident } from "@/types/domain";

type PaymentFormProps = {
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payment: Payment) => void;
  payment?: Payment | null;
  residents: Resident[];
};

export function PaymentForm({
  isSubmitting = false,
  onCancel,
  onSubmit,
  payment,
  residents
}: PaymentFormProps) {
  const form = usePaymentForm(payment);

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(toPayment(values)))}>
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={form.control}
          name="residentId"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Morador">
              <select
                {...field}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        />
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
          control={form.control}
          name="paidAt"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Pago em">
              <DatePicker onValueChange={field.onChange} value={field.value ?? ""} />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="proofKey"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Comprovante">
              <Input {...field} placeholder="proofs/2026-05/comprovante.pdf" value={field.value ?? ""} />
            </FormField>
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          Salvar pagamento
        </Button>
      </div>
    </form>
  );
}
