"use client";

import { Controller } from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/organisms/form-field";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import type { ResidentFormValues } from "@/lib/schemas/residents/resident-schema";
import type { ResidentType } from "@/types/domain";

type ResidentFormProps = {
  residentTypes: ResidentType[];
};

export function ResidentForm({ residentTypes }: ResidentFormProps) {
  const { control } = useFormContext<ResidentFormValues>();
  const emailValue = useWatch({ control, name: "email" });
  const canToggleAdministrator = z.string().email().safeParse(emailValue?.trim() || "").success;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Nome">
              <Input {...field} placeholder="Ana Martins" />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="E-mail">
              <Input {...field} inputMode="email" placeholder="ana@example.com" type="email" />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Unidade">
              <Input {...field} placeholder="A-101" />
            </FormField>
          )}
        />
        <Controller
          control={control}
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
          control={control}
          name="residentTypeId"
          render={({ field, fieldState }) => (
            <FormField error={fieldState.error?.message} label="Tipo">
              <select
                {...field}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {residentTypes.map((residentType) => (
                  <option key={residentType.id} value={residentType.id}>
                    {residentType.label}
                  </option>
                ))}
              </select>
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="isAdministrator"
          render={({ field }) => (
            <label
              className={`md:col-span-2 flex items-start gap-3 rounded-md border bg-background p-3 text-sm font-medium ${
                canToggleAdministrator ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              }`}
            >
              <input
                checked={Boolean(field.value)}
                className="mt-1 size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={!canToggleAdministrator}
                onChange={(event) => field.onChange(event.target.checked)}
                type="checkbox"
              />
              <span className="grid gap-1">
                <span>Administrador</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {canToggleAdministrator
                    ? "Pode operar a area privada com permissao de administrador."
                    : "Informe um e-mail valido para liberar esta opcao."}
                </span>
              </span>
            </label>
          )}
        />
      </div>
    </div>
  );
}
