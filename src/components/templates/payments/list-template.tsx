"use client";

import { Pencil, Plus, Trash2, Paperclip } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/organisms/app-shell";
import { ConfirmDeleteDialog } from "@/components/organisms/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/commons/formats";
import { useDeletePaymentsMutation } from "@/lib/hooks/payments/useDeletePaymentsMutation";
import { usePaymentsQuery } from "@/lib/hooks/payments/usePaymentsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";

export function PaymentsTemplate() {
  const paymentsQuery = usePaymentsQuery();
  const residentsQuery = useResidentsQuery();
  const deletePaymentsMutation = useDeletePaymentsMutation();
  const payments = paymentsQuery.data ?? [];
  const residents = residentsQuery.data ?? [];

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Controle manual</p>
            <h1 className="text-2xl font-semibold tracking-normal">Pagamentos</h1>
          </div>
          <Button asChild>
            <Link href="/payments/new">
              <Plus className="size-4" />
              Registrar pagamento
            </Link>
          </Button>
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
                      <TableCell>{formatDate(payment.month)}</TableCell>
                      <TableCell>{formatCurrency(payment.amountInCents)}</TableCell>
                      <TableCell>
                        {payment.proofKey ? (
                          <span className="inline-flex items-center gap-1 text-sm text-primary">
                            <Paperclip className="size-4" />
                            anexado
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
    </AppShell>
  );
}
