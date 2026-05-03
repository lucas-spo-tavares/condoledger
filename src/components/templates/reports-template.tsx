"use client";

import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportsQuery } from "@/lib/hooks/reports/useReportsQuery";
import { formatCurrency, formatMonth } from "@/lib/commons/formats";

export function ReportsTemplate() {
  const reportsQuery = useReportsQuery();
  const currentReport = reportsQuery.data?.[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div>
          <p className="text-sm text-muted-foreground">Fechamento</p>
          <h1 className="text-2xl font-semibold tracking-normal">Relatorios mensais</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              {currentReport ? formatMonth(currentReport.month) : "Carregando..."}
            </CardTitle>
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
            <div className="sm:col-span-2 lg:col-span-4">
              <Button>
                <Download className="size-4" />
                Gerar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
