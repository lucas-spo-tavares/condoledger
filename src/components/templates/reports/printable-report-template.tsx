"use client";

import * as React from "react";
import { FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/templates/dashboard/dashboard-charts";
import { PreviewPage } from "@/components/templates/reports/preview-page";
import { formatCurrency, formatDate, formatMonth } from "@/lib/commons/formats";
import type { DashboardMonthPoint } from "@/lib/reports/dashboard-series";
import type { ExpenseListItem, MonthlyReport, ReceiptListItem, Resident } from "@/types/domain";

type PrintableReportTemplateProps = {
  description: string;
  report: MonthlyReport | null;
  activeResidentsCount: number;
  residents: Resident[];
  receipts: ReceiptListItem[];
  expenses: ExpenseListItem[];
  dashboardSeries: DashboardMonthPoint[];
};

export function PrintableReportTemplate({
  description,
  report,
  activeResidentsCount,
  residents,
  receipts,
  expenses,
  dashboardSeries
}: PrintableReportTemplateProps) {
  const printedOnceRef = React.useRef(false);
  const reportMonth = report?.month ?? dashboardSeries.at(-1)?.month ?? new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = `Relatório - ${formatMonth(reportMonth)}`;

    const timer = window.setTimeout(() => {
      if (!printedOnceRef.current) {
        printedOnceRef.current = true;
        window.print();
      }
    }, 300);

    return () => {
      document.title = previousTitle;
      window.clearTimeout(timer);
    };
  }, [reportMonth]);

  const residentsById = React.useMemo(() => new Map(residents.map((resident) => [resident.id, resident])), [residents]);
  const receiptPages = React.useMemo(() => {
    const pages: ReceiptListItem[][] = [];
    const receiptsPerPage = 20;

    for (let index = 0; index < receipts.length; index += receiptsPerPage) {
      pages.push(receipts.slice(index, index + receiptsPerPage));
    }

    return pages.length ? pages : [[]];
  }, [receipts]);

  return (
    <>
      <PreviewPage breakAfterPage>
        <Card className="min-w-0 break-inside-avoid">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <CardTitle className="text-base">
                {report ? formatMonth(report.month) : formatMonth(reportMonth)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-3">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Moradores ativos</p>
              <p className="text-lg font-semibold">{activeResidentsCount}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Total do caixa</p>
              <p className="text-lg font-semibold">{formatCurrency(report?.balanceInCents ?? 0)}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Recebido no período</p>
              <p className="text-lg font-semibold">{formatCurrency(report?.receivedRevenueInCents ?? 0)}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Despesas no período</p>
              <p className="text-lg font-semibold">{formatCurrency(report?.expensesInCents ?? 0)}</p>
            </div>
          </CardContent>
          </Card>

        <DashboardCharts data={dashboardSeries} isAnimationActive={false} />
      </PreviewPage>

      <PreviewPage breakAfterPage>

          <Card className="min-w-0 break-inside-avoid">
            <CardHeader>
              <CardTitle>Resumo do período</CardTitle>
              <CardDescription>Informações consolidadas do relatório atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="mt-1 text-sm leading-relaxed">{description}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Mês de referência</p>
                <p className="mt-1 text-sm font-medium">{formatMonth(reportMonth)}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Receita prevista</p>
                <p className="mt-1 text-sm font-medium">{formatCurrency(report?.expectedRevenueInCents ?? 0)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 break-inside-avoid">
            <CardHeader>
              <CardTitle>Despesas detalhadas</CardTitle>
              <CardDescription>Todos os lançamentos de despesa do mês selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-muted/40">
                    <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
                      <th>Categoria</th>
                      <th>Descrição</th>
                      <th>Pago em</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length ? (
                      expenses.map((expense) => (
                        <tr key={expense.id} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                          <td className="font-medium">{expense.category}</td>
                          <td>{expense.description}</td>
                          <td>{formatDate(expense.paidAt)}</td>
                          <td className="text-right">{formatCurrency(expense.amountInCents)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-6 text-center text-sm text-muted-foreground" colSpan={4}>
                          Nenhuma despesa encontrada para este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </PreviewPage>

      {receiptPages.map((receiptPage, pageIndex) => {
        const isLastPage = pageIndex === receiptPages.length - 1;

        return (
          <PreviewPage key={`receipts-page-${pageIndex}`} breakAfterPage={!isLastPage}>
            <section className="flex h-full min-h-0 flex-col gap-4">
              <Card className="min-w-0 break-inside-avoid">
                <CardHeader>
                  <CardTitle>Recebimentos individuais</CardTitle>
                  <CardDescription>Valores recebidos ou registrados por morador no mês selecionado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-muted/40">
                        <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
                          <th>Morador</th>
                          <th>Unidade</th>
                          <th>Descrição</th>
                          <th className="text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptPage.length ? (
                          receiptPage.map((receipt) => {
                            const resident = residentsById.get(receipt.residentId);

                            return (
                              <tr key={receipt.id} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                                <td className="font-medium">{resident?.name ?? "Morador removido"}</td>
                                <td>{resident?.unit ?? "-"}</td>
                                <td>{receipt.description ?? "-"}</td>
                                <td className="text-right">{formatCurrency(receipt.amountInCents)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="px-3 py-6 text-center text-sm text-muted-foreground" colSpan={4}>
                              Nenhum recebimento encontrado para este período.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </PreviewPage>
        );
      })}
    </>
  );
}
