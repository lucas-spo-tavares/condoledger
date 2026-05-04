import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Expense, MonthlyReport, Receipt, Resident } from "@/types/domain";

export type DashboardMonthPoint = {
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

export function buildDashboardSeries(params: {
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
