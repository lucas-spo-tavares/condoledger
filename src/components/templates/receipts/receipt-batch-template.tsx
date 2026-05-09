"use client";

import * as React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBatchReceiptsMutation } from "@/lib/hooks/receipts/useBatchReceiptsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { useSafeBackNavigation } from "@/lib/navigation/safe-back";
import { useReceiptBatchForm } from "@/lib/forms/receipts/useReceiptBatchForm";
import { getLocalTodayValue } from "@/lib/schemas/commons/date-schema";
import { createReceiptBatchItemValues } from "@/lib/schemas/receipts/receipt-batch-schema";
import type { ReceiptBatchFormValues } from "@/lib/schemas/receipts/receipt-batch-schema";
import type { Resident } from "@/types/domain";

function getTodayValue() {
  return getLocalTodayValue();
}

function getCurrentMonthValue() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
}

function createDefaultItem(resident: Resident) {
  return createReceiptBatchItemValues({
    residentId: resident.id,
    amount: resident.monthlyContributionInCents / 100,
    receivedAt: getTodayValue()
  });
}

export function ReceiptBatchTemplate() {
  const goBack = useSafeBackNavigation("/backoffice/receipts");
  const residentsQuery = useResidentsQuery({ status: "active" });
  const batchReceiptsMutation = useBatchReceiptsMutation();
  const residents = residentsQuery.data ?? [];
  const isLoadingResidents = residentsQuery.isLoading;
  const form = useReceiptBatchForm({
    description: "",
    month: getCurrentMonthValue(),
    items: []
  });
  const { control, handleSubmit, reset } = form;
  const { fields, remove } = useFieldArray({
    control,
    name: "items"
  });
  const hasSeededRowsRef = React.useRef(false);

  React.useEffect(() => {
    if (hasSeededRowsRef.current || !residentsQuery.isSuccess) {
      return;
    }

    reset({
      description: "",
      month: getCurrentMonthValue(),
      items: residents.map((resident) => createDefaultItem(resident))
    });
    hasSeededRowsRef.current = true;
  }, [residents, residentsQuery.isSuccess, reset]);

  function onSubmit(values: ReceiptBatchFormValues) {
    batchReceiptsMutation.mutate(
      values.items.map((item) => ({
        residentId: item.residentId,
        month: values.month,
        amountInCents: Math.round(item.amount * 100),
        description: values.description?.trim() || undefined,
        receivedAt: item.receivedAt,
        proofAttachments: []
      })),
      {
        onSuccess: () => goBack()
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-sm text-muted-foreground">Controle manual</p>
        <h1 className="text-2xl font-semibold tracking-normal">Recebimentos em lote</h1>
      </div>

      <Card className="border-amber-200 bg-amber-50/70">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Atenção</Badge>
            <CardTitle className="text-base">Somente moradores ativos entram neste lote</CardTitle>
          </div>
          <CardDescription>
            O sistema vai gerar um recebimento para cada morador ativo, usando a mensalidade cadastrada.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prévia dos lançamentos</CardTitle>
          <CardDescription>
            {fields.length
              ? `${fields.length} moradores ativos serão incluídos. A descrição e a competência abaixo serão aplicadas a todos os lançamentos.`
              : isLoadingResidents
                ? "Carregando moradores ativos..."
                : "Nenhum morador ativo disponível para lançamento."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5 grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-2">
              <Controller
                control={control}
                name="month"
                render={({ field, fieldState }) => (
                  <div className="grid gap-1">
                    <MonthPicker
                      disabled
                      onValueChange={field.onChange}
                      placeholder="Mês de competência"
                      value={field.value}
                    />
                    <span className="min-h-4 text-xs text-destructive">{fieldState.error?.message || "\u00A0"}</span>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <div className="grid gap-1 md:col-span-2">
                    <Input
                      {...field}
                      placeholder="Descrição aplicada a todos os lançamentos"
                      value={field.value ?? ""}
                    />
                    <span className="min-h-4 text-xs text-destructive">{fieldState.error?.message || "\u00A0"}</span>
                  </div>
                )}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Morador</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Recebido em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const resident = residents.find((item) => item.id === field.residentId);

                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{resident?.name ?? field.residentId}</TableCell>
                      <TableCell>{resident?.unit ?? "—"}</TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`items.${index}.amount`}
                          render={({ field: amountField, fieldState }) => (
                            <div className="grid gap-1">
                              <CurrencyInput
                                className="min-w-32"
                                onBlur={amountField.onBlur}
                                onValueChange={amountField.onChange}
                                ref={amountField.ref}
                                value={typeof amountField.value === "number" ? amountField.value : 0}
                              />
                              <span className="min-h-4 text-xs text-destructive">
                                {fieldState.error?.message || "\u00A0"}
                              </span>
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={control}
                          name={`items.${index}.receivedAt`}
                          render={({ field: receivedAtField, fieldState }) => (
                            <div className="grid gap-1">
                              <DatePicker onValueChange={receivedAtField.onChange} value={receivedAtField.value} />
                              <span className="min-h-4 text-xs text-destructive">
                                {fieldState.error?.message || "\u00A0"}
                              </span>
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            aria-label={`Remover ${resident?.name ?? field.residentId}`}
                            onClick={() => remove(index)}
                            type="button"
                            variant="outline"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {isLoadingResidents ? (
                  <TableRow>
                    <TableCell className="text-sm text-muted-foreground" colSpan={5}>
                      Carregando moradores ativos...
                    </TableCell>
                  </TableRow>
                ) : !fields.length ? (
                  <TableRow>
                    <TableCell className="text-sm text-muted-foreground" colSpan={5}>
                      Cadastre ou ative moradores para habilitar o lançamento em lote.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>

            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={goBack} type="button" variant="outline">
                Cancelar
              </Button>
              <Button
                disabled={!fields.length || isLoadingResidents || batchReceiptsMutation.isPending}
                type="submit"
              >
                {batchReceiptsMutation.isPending ? "Salvando lote..." : "Salvar lote"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
