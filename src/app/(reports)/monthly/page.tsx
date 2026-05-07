import { PrintableReportTemplate } from "@/components/templates/reports/printable-report-template";
import { buildDashboardSeries } from "@/lib/reports/dashboard-series";
import { getExpenses } from "@/lib/servers/expenses";
import { getReports } from "@/lib/servers/reports";
import { getReceipts } from "@/lib/servers/receipts";
import { getResidents } from "@/lib/servers/residents";

export default async function MonthlyReportPage({
  searchParams
}: {
  searchParams?: Promise<{
    description?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  const [residents, receipts, expenses, reports] = await Promise.all([
    getResidents(),
    getReceipts(),
    getExpenses(),
    getReports()
  ]);

  const dashboardSeries = buildDashboardSeries({
    residents,
    receipts,
    expenses,
    reports
  });
  const currentReport = reports[0] ?? null;
  const description = resolvedSearchParams?.description?.trim() || "Relatório mensal do condomínio";

  return (
    <PrintableReportTemplate
      activeResidentsCount={residents.filter((resident) => resident.status === "active").length}
      dashboardSeries={dashboardSeries}
      description={description}
      expenses={currentReport ? expenses.filter((expense) => expense.month === currentReport.month) : []}
      receipts={currentReport ? receipts.filter((receipt) => receipt.month === currentReport.month) : []}
      residents={residents}
      report={currentReport}
    />
  );
}
