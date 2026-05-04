import "server-only";

import type { MonthlyReport } from "@/types/domain";

import { getExpenses } from "@/lib/servers/expenses";
import { getPayments } from "@/lib/servers/payments";

type MonthlyTotals = {
  expectedRevenueInCents: number;
  receivedRevenueInCents: number;
  expensesInCents: number;
};

export async function getReports() {
  const [payments, expenses] = await Promise.all([getPayments(), getExpenses()]);
  const totalsByMonth = new Map<string, MonthlyTotals>();

  for (const payment of payments) {
    const totals = totalsByMonth.get(payment.month) ?? createMonthlyTotals();

    totals.expectedRevenueInCents += payment.amountInCents;

    if (payment.status === "confirmed") {
      totals.receivedRevenueInCents += payment.amountInCents;
    }

    totalsByMonth.set(payment.month, totals);
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
