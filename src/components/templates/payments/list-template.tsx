"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, Paperclip } from "lucide-react";
import Link from "next/link";

import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/commons/formats";
import { useDebounce } from "@/lib/hooks/debounce";
import { useDeletePaymentsMutation } from "@/lib/hooks/payments/useDeletePaymentsMutation";
import { usePaymentsQuery } from "@/lib/hooks/payments/usePaymentsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import type { PaymentStatus } from "@/types/domain";

export function PaymentsTemplate() {
  const residentsQuery = useResidentsQuery();
  const deletePaymentsMutation = useDeletePaymentsMutation();
  const residents = residentsQuery.data ?? [];
  const currentMonth = React.useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
  }, []);
  const [month, setMonth] = React.useState(currentMonth);
  const [status, setStatus] = React.useState<"all" | PaymentStatus>("all");
  const [nameSearch, setNameSearch] = React.useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 1000);
  const paymentsQuery = usePaymentsQuery({
    month,
    status,
    q: debouncedNameSearch
  });
  const payments = paymentsQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Controle manual</p>
            <h1 className="text-2xl font-semibold tracking-normal">Pagamentos</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/payments/batch">Pagamentos em lote</Link>
            </Button>
            <Button asChild>
              <Link href="/payments/new">
                <Plus className="size-4" />
                Registrar pagamento
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[240px_220px_1fr]">
          <MonthPicker onValueChange={setMonth} value={month} />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => setStatus(event.target.value as "all" | PaymentStatus)}
            value={status}
          >
            <option value="all">Todos os status</option>
            <option value="confirmed">Confirmado</option>
            <option value="pending">Pendente</option>
            <option value="voided">Cancelado</option>
          </select>
          <Input
            onChange={(event) => setNameSearch(event.target.value)}
            placeholder="Buscar por nome do morador"
            value={nameSearch}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Contribuicoes mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Morador</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const resident = residents.find((item) => item.id === payment.residentId);

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{resident?.name}</TableCell>
                      <TableCell>{resident?.unit}</TableCell>
                      <TableCell>{formatDate(payment.month)}</TableCell>
                      <TableCell>{formatCurrency(payment.amountInCents)}</TableCell>
                      <TableCell>
                        {payment.proofAttachments.length ? (
                          <span className="inline-flex items-center gap-1 text-sm text-primary">
                            <Paperclip className="size-4" />
                            {payment.proofAttachments.length > 1
                              ? `${payment.proofAttachments.length} anexos`
                              : "anexado"}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">pendente</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "confirmed" ? "success" : "warning"}>
                          {formatPaymentStatus(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="icon" type="button" variant="outline">
                            <Link href={`/payments/${payment.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <ConfirmDeleteDialog
                            disabled={deletePaymentsMutation.isPending}
                            description="Tem certeza que deseja remover este pagamento? Esta operacao nao pode ser desfeita."
                            onConfirm={() => deletePaymentsMutation.mutate(payment.id)}
                            title="Confirmar exclusao"
                          >
                            <Trash2 className="size-4" />
                          </ConfirmDeleteDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
