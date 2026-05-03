"use client";

import { Banknote, CircleDollarSign, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExpensesQuery } from "@/lib/hooks/expenses/useExpensesQuery";
import { usePaymentsQuery } from "@/lib/hooks/payments/usePaymentsQuery";
import { useReportsQuery } from "@/lib/hooks/reports/useReportsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { formatCurrency, formatDate, formatMonth, formatPaymentStatus } from "@/lib/commons/formats";

export function DashboardTemplate() {
  const residentsQuery = useResidentsQuery();
  const paymentsQuery = usePaymentsQuery();
  const expensesQuery = useExpensesQuery();
  const reportsQuery = useReportsQuery();

  const residents = residentsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const expenses = expensesQuery.data ?? [];
  const currentReport = reportsQuery.data?.[0];

  const stats = [
    {
      label: "Recebido",
      value: formatCurrency(currentReport?.receivedRevenueInCents ?? 0),
      icon: CircleDollarSign
    },
    {
      label: "Despesas",
      value: formatCurrency(currentReport?.expensesInCents ?? 0),
      icon: Banknote
    },
    {
      label: "Moradores",
      value: residents.length.toString(),
      icon: ShieldCheck
    },
    {
      label: "Relatorios abertos",
      value: (reportsQuery.data?.length ?? 0).toString(),
      icon: FileText
    }
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {currentReport ? formatMonth(currentReport.month) : "Carregando..."}
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">Resumo mensal do condominio</h1>
          </div>
          <Badge variant="warning">Relatorio em aberto</Badge>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos recentes</CardTitle>
              <CardDescription>Confirmacoes manuais com comprovantes opcionais.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Morador</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const resident = residents.find((item) => item.id === payment.residentId);

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{resident?.name}</TableCell>
                        <TableCell>{formatDate(payment.month)}</TableCell>
                        <TableCell>{formatCurrency(payment.amountInCents)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "confirmed" ? "success" : "warning"}>
                            {formatPaymentStatus(payment.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas do mes</CardTitle>
              <CardDescription>Custos atuais antes do fechamento em PDF.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.map((expense) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
                  key={expense.id}
                >
                  <div>
                    <p className="text-sm font-medium">{expense.category}</p>
                    <p className="text-xs text-muted-foreground">{expense.description}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(expense.amountInCents)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
    </div>
  );
}
