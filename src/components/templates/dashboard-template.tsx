"use client";

import { Download, FileText } from "lucide-react";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useExpensesQuery } from "@/lib/hooks/expenses/useExpensesQuery";
import { useReceiptsQuery } from "@/lib/hooks/payments/usePaymentsQuery";
import { useReportsQuery } from "@/lib/hooks/reports/useReportsQuery";
import { useResidentsQuery } from "@/lib/hooks/residents/useResidentsQuery";
import { formatCurrency, formatMonth } from "@/lib/commons/formats";
import type { Expense, Receipt, Resident, MonthlyReport } from "@/types/domain";

const chartConfig = {
  residents: { label: "Moradores", color: "#2563eb" },
  expenses: { label: "Despesas", color: "#dc2626" },
  receipts: { label: "Recebimentos", color: "#16a34a" },
  accumulated: { label: "Acumulado", color: "#7c3aed" }
} as const;

type DashboardMonthPoint = {
  month: string;
  label: string;
  residents: number;
  expenses: number;
  receipts: number;
  accumulated: number;
};

function monthKey(value: string) {
  return `${value.slice(0, 7)}-01`;
}

function monthLabel(value: string) {
  return format(parseISO(value), "MMM/yy", { locale: ptBR });
}

function sumByMonth<T>(items: T[], getMonth: (item: T) => string, getValue: (item: T) => number) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    const key = monthKey(getMonth(item));
    accumulator[key] = (accumulator[key] ?? 0) + getValue(item);
    return accumulator;
  }, {});
}

function buildDashboardSeries(params: {
  residents: Resident[];
  receipts: Receipt[];
  expenses: Expense[];
  reports: MonthlyReport[];
}): DashboardMonthPoint[] {
  const monthSet = new Set<string>();

  for (const resident of params.residents) {
    if (resident.createdAt) {
      monthSet.add(monthKey(resident.createdAt));
    }
  }

  for (const receipt of params.receipts) {
    monthSet.add(monthKey(receipt.month));
  }

  for (const expense of params.expenses) {
    monthSet.add(monthKey(expense.month));
  }

  for (const report of params.reports) {
    monthSet.add(monthKey(report.month));
  }

  const months = [...monthSet].sort().slice(-12);
  const receiptsByMonth = sumByMonth(params.receipts, (item) => item.month, (item) => item.amountInCents);
  const expensesByMonth = sumByMonth(params.expenses, (item) => item.month, (item) => item.amountInCents);
  const reportsByMonth = params.reports.reduce<Record<string, MonthlyReport>>((accumulator, report) => {
    accumulator[monthKey(report.month)] = report;
    return accumulator;
  }, {});

  return months.map((month) => {
    const residentsCount = params.residents.filter((resident) => {
      if (!resident.createdAt) {
        return false;
      }

      return monthKey(resident.createdAt) <= month;
    }).length;

    const receipts = receiptsByMonth[month] ?? 0;
    const expenses = expensesByMonth[month] ?? 0;
    const report = reportsByMonth[month];

    return {
      month,
      label: monthLabel(month),
      residents: residentsCount,
      expenses,
      receipts,
      accumulated: report ? report.balanceInCents : receipts - expenses
    };
  });
}

export function DashboardTemplate() {
  const residentsQuery = useResidentsQuery();
  const receiptsQuery = useReceiptsQuery();
  const expensesQuery = useExpensesQuery();
  const reportsQuery = useReportsQuery();

  const residents = residentsQuery.data ?? [];
  const receipts = receiptsQuery.data ?? [];
  const expenses = expensesQuery.data ?? [];
  const reports = reportsQuery.data ?? [];
  const currentReport = reports[0];
  const dashboardSeries = buildDashboardSeries({
    residents,
    receipts,
    expenses,
    reports
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {currentReport ? formatMonth(currentReport.month) : "Carregando..."}
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">Inicio do condominio</h1>
        </div>
        <Button >
          <Download className="size-4" />
          Gerar PDF
        </Button>
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

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total de moradores por mês</CardTitle>
            <CardDescription>Quantos cadastros foram acumulados ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[280px]" config={chartConfig}>
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={dashboardSeries} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={56} />
                  <Tooltip content={<ChartTooltipContent valueFormatter={(value) => value.toLocaleString("pt-BR")} />} />
                  <Bar dataKey="residents" fill={chartConfig.residents.color} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por mês</CardTitle>
            <CardDescription>Total mensal das despesas do condomínio.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[280px]" config={chartConfig}>
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={dashboardSeries} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                  <Bar dataKey="expenses" fill={chartConfig.expenses.color} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo em caixa</CardTitle>
            <CardDescription>Evolução do saldo acumulado mês a mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[280px]" config={chartConfig}>
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={dashboardSeries} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                  <Line
                    dataKey="accumulated"
                    stroke={chartConfig.accumulated.color}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recebimentos por mês</CardTitle>
            <CardDescription>Total mensal de recebimentos confirmados.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[280px]" config={chartConfig}>
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={dashboardSeries} margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <Tooltip content={<ChartTooltipContent valueFormatter={(value) => formatCurrency(value)} />} />
                  <Bar dataKey="receipts" fill={chartConfig.receipts.color} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
