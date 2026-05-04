import "server-only";

import type { MonthlyReport } from "@/types/domain";

import { getExpenses } from "@/lib/servers/expenses";
import { getReceipts } from "@/lib/servers/payments";

type MonthlyTotals = {
  expectedRevenueInCents: number;
  receivedRevenueInCents: number;
  expensesInCents: number;
};

export async function getReports() {
  const [receipts, expenses] = await Promise.all([getReceipts(), getExpenses()]);
  const totalsByMonth = new Map<string, MonthlyTotals>();

  for (const receipt of receipts) {
    const totals = totalsByMonth.get(receipt.month) ?? createMonthlyTotals();

    totals.expectedRevenueInCents += receipt.amountInCents;

    if (receipt.status === "confirmed") {
      totals.receivedRevenueInCents += receipt.amountInCents;
    }

    totalsByMonth.set(receipt.month, totals);
  }

  for (const expense of expenses) {
    const totals = totalsByMonth.get(expense.month) ?? createMonthlyTotals();

    totals.expensesInCents += expense.amountInCents;
    totalsByMonth.set(expense.month, totals);
  }

  const reports: MonthlyReport[] = [...totalsByMonth.entries()]
    .map(([month, totals]) => ({
      month,
      expectedRevenueInCents: totals.expectedRevenueInCents,
      receivedRevenueInCents: totals.receivedRevenueInCents,
      expensesInCents: totals.expensesInCents,
      balanceInCents: totals.receivedRevenueInCents - totals.expensesInCents
    }))
    .sort((left, right) => right.month.localeCompare(left.month));

  return reports;
}

function createMonthlyTotals(): MonthlyTotals {
  return {
    expectedRevenueInCents: 0,
    receivedRevenueInCents: 0,
    expensesInCents: 0
  };
}
