"use client";

import * as React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/organisms/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBatchPaymentsMutation } from "@/lib/hooks/payments/useBatchPaymentsMutation";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { createPaymentBatchItemValues } from "@/lib/schemas/payments/payment-batch-schema";
import { usePaymentBatchForm } from "@/lib/forms/payments/usePaymentBatchForm";
import type { PaymentBatchFormValues } from "@/lib/schemas/payments/payment-batch-schema";
import type { PaymentStatus, Resident } from "@/types/domain";

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthValue() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
}

function createDefaultItem(resident: Resident) {
  return createPaymentBatchItemValues({
    residentId: resident.id,
    amount: resident.monthlyContributionInCents / 100,
    month: getCurrentMonthValue(),
    paidAt: getTodayValue(),
    status: "confirmed"
  });
}

export function PaymentBatchTemplate() {
  const router = useRouter();
  const residentsQuery = useResidentsQuery({ status: "active" });
  const batchPaymentsMutation = useBatchPaymentsMutation();
  const residents = residentsQuery.data ?? [];
  const isLoadingResidents = residentsQuery.isLoading;
  const form = usePaymentBatchForm({ items: [] });
  const { control, handleSubmit, reset } = form;
  const { fields, remove } = useFieldArray({
    control,
    name: "items"
  });
  const hasSeededRowsRef = React.useRef(false);

  React.useEffect(() => {
    if (hasSeededRowsRef.current) {
      return;
    }

    if (!residentsQuery.isSuccess) {
      return;
    }

    reset({
      items: residents.map((resident) => createDefaultItem(resident))
    });
    hasSeededRowsRef.current = true;
  }, [reset, residents, residentsQuery.isSuccess]);

  function onSubmit(values: PaymentBatchFormValues) {
    batchPaymentsMutation.mutate(
      values.items.map((item) => ({
        residentId: item.residentId,
        month: item.month,
        amountInCents: Math.round(item.amount * 100),
        status: item.status,
        paidAt: item.paidAt,
        proofAttachments: []
      })),
      {
        onSuccess: () => router.push("/payments")
      }
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div>
          <p className="text-sm text-muted-foreground">Controle manual</p>
          <h1 className="text-2xl font-semibold tracking-normal">Pagamentos em lote</h1>
        </div>

        <Card className="border-amber-200 bg-amber-50/70">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="warning">Atenção</Badge>
              <CardTitle className="text-base">Somente moradores ativos entram neste lote</CardTitle>
            </div>
            <CardDescription>
              O sistema vai gerar um pagamento confirmado para cada morador ativo, usando a mensalidade cadastrada.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévia dos lançamentos</CardTitle>
            <CardDescription>
              {fields.length
                ? `${fields.length} moradores ativos serão incluídos. Cada linha pode ser editada individualmente.`
                : isLoadingResidents
                  ? "Carregando moradores ativos..."
                  : "Nenhum morador ativo disponível para lançamento."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Morador</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead>Pago em</TableHead>
                    <TableHead>Status</TableHead>
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
                            name={`items.${index}.month`}
                            render={({ field: monthField, fieldState }) => (
                              <div className="grid gap-1">
                                <MonthPicker onValueChange={monthField.onChange} value={monthField.value} />
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
                            name={`items.${index}.paidAt`}
                            render={({ field: paidAtField, fieldState }) => (
                              <div className="grid gap-1">
                                <DatePicker onValueChange={paidAtField.onChange} value={paidAtField.value} />
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
                            name={`items.${index}.status`}
                            render={({ field: statusField, fieldState }) => (
                              <div className="grid gap-1">
                                <select
                                  {...statusField}
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  <option value="confirmed">Confirmado</option>
                                  <option value="pending">Pendente</option>
                                  <option value="voided">Cancelado</option>
                                </select>
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
                      <TableCell className="text-sm text-muted-foreground" colSpan={7}>
                        Carregando moradores ativos...
                      </TableCell>
                    </TableRow>
                  ) : !fields.length ? (
                    <TableRow>
                      <TableCell className="text-sm text-muted-foreground" colSpan={7}>
                        Cadastre ou ative moradores para habilitar o lançamento em lote.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>

              <div className="mt-5 flex justify-end gap-2">
                <Button onClick={() => router.push("/payments")} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button
                  disabled={!fields.length || isLoadingResidents || batchPaymentsMutation.isPending}
                  type="submit"
                >
                  {batchPaymentsMutation.isPending ? "Salvando lote..." : "Salvar lote"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
