"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { useCurrentUser } from "@/components/providers/current-user-provider";
import { DashboardCharts } from "@/components/templates/dashboard/dashboard-charts";
import { GeneratePdfDialog } from "@/components/templates/dashboard/generate-pdf-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpensesQuery } from "@/lib/hooks/expenses/useExpensesQuery";
import { useReceiptsQuery } from "@/lib/hooks/receipts/useReceiptsQuery";
import { useReportsQuery } from "@/lib/hooks/reports/useReportsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { formatCurrency, formatMonth } from "@/lib/commons/formats";
import { buildDashboardSeries } from "@/lib/reports/dashboard-series";

export function DashboardTemplate() {
  const currentUser = useCurrentUser();
  const isAdministrator = Boolean(currentUser?.isAdministrator);
  const residentsQuery = useResidentsQuery();
  const receiptsQuery = useReceiptsQuery({ status: "confirmed" });
  const pendingReceiptsQuery = useReceiptsQuery({ status: "pending" }, { enabled: isAdministrator });
  const expensesQuery = useExpensesQuery();
  const reportsQuery = useReportsQuery();

  const residents = residentsQuery.data ?? [];
  const receipts = receiptsQuery.data ?? [];
  const pendingReceipts = pendingReceiptsQuery.data ?? [];
  const expenses = expensesQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const currentReport = reports[0];
  const dashboardSeries = buildDashboardSeries({
    residents,
    receipts,
    expenses,
    reports
  });
  const pendingAmountInCents = pendingReceipts.reduce((total, receipt) => total + receipt.amountInCents, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {currentReport ? formatMonth(currentReport.month) : "Carregando..."}
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">Inicio do condominio</h1>
        </div>
        <GeneratePdfDialog
          defaultDescription={currentReport ? `Relatório mensal de ${formatMonth(currentReport.month)}` : "Relatório mensal do condomínio"}
          showDescriptionDialog={isAdministrator}
        />
      </div>

      <section>
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle className="text-base">
                {currentReport ? formatMonth(currentReport.month) : "Carregando..."}
              </CardTitle>
            </div>
            <CardDescription>Receitas, despesas, saldo, pagadores e unidades pendentes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Previsto</p>
              <p className="text-lg font-semibold">{formatCurrency(currentReport?.expectedRevenueInCents ?? 0)}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Recebido</p>
              <p className="text-lg font-semibold">{formatCurrency(currentReport?.receivedRevenueInCents ?? 0)}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-lg font-semibold">{formatCurrency(currentReport?.expensesInCents ?? 0)}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-lg font-semibold">{formatCurrency(currentReport?.balanceInCents ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {isAdministrator ? (
        <section>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Recebimentos aguardando confirmação</CardTitle>
                <CardDescription>Pagamentos enviados pelo portal que ainda não entraram nos totais.</CardDescription>
              </div>
              <Link className="text-sm font-medium text-primary hover:underline" href="/backoffice/receipts?status=pending">
                Revisar pendentes
              </Link>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">{pendingReceipts.length}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Valor aguardando</p>
                <p className="text-lg font-semibold">{formatCurrency(pendingAmountInCents)}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <DashboardCharts data={dashboardSeries} />
    </div>
  );
}
