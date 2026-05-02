"use client";

import { Controller } from "react-hook-form";

import { FormField } from "@/components/organisms/form-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { useResidentForm, toResident } from "@/lib/forms/residents/useResidentForm";
import type { Resident } from "@/types/domain";

type ResidentFormProps = {
  resident?: Resident | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (resident: Resident) => void;
};

export function ResidentForm({ resident, isSubmitting = false, onCancel, onSubmit }: ResidentFormProps) {
  const form = useResidentForm(resident);

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => onSubmit(toResident(values)))}>
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Nome">
              <Input {...field} placeholder="Ana Martins" />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="E-mail">
              <Input {...field} inputMode="email" placeholder="ana@example.com" type="email" />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="unit"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Unidade">
              <Input {...field} placeholder="A-101" />
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="monthlyContribution"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Mensalidade">
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
          name="type"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Tipo">
              <select
                {...field}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="resident">Morador</option>
                <option value="store">Loja</option>
                <option value="church">Igreja</option>
                <option value="apartment">Apartamento/edificio</option>
              </select>
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </FormField>
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          Salvar morador
        </Button>
      </div>
    </form>
  );
}
