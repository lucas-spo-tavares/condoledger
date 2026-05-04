import "server-only";

import type { MonthlyReport } from "@/types/domain";

import { getExpenses } from "@/lib/servers/expenses";
import { getInitialBalances } from "@/lib/servers/initial-balances";
import { getReceipts } from "@/lib/servers/receipts";

type MonthlyTotals = {
  expectedRevenueInCents: number;
  receivedRevenueInCents: number;
  expensesInCents: number;
};

export async function getReports() {
  const [receipts, expenses, initialBalances] = await Promise.all([getReceipts(), getExpenses(), getInitialBalances()]);
  const totalsByMonth = new Map<string, MonthlyTotals>();
  const initialBalanceByMonth = new Map<string, number>();

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

  for (const initialBalance of initialBalances) {
    initialBalanceByMonth.set(
      initialBalance.month,
      (initialBalanceByMonth.get(initialBalance.month) ?? 0) + initialBalance.amountInCents
    );

    if (!totalsByMonth.has(initialBalance.month)) {
      totalsByMonth.set(initialBalance.month, createMonthlyTotals());
    }
  }

  let balanceInCents = 0;
  const reports: MonthlyReport[] = [...totalsByMonth.entries()]
    .sort(([leftMonth], [rightMonth]) => leftMonth.localeCompare(rightMonth))
    .map(([month, totals]) => ({
      month,
      expectedRevenueInCents: totals.expectedRevenueInCents,
      receivedRevenueInCents: totals.receivedRevenueInCents,
      expensesInCents: totals.expensesInCents,
      balanceInCents: (balanceInCents +=
        (initialBalanceByMonth.get(month) ?? 0) + totals.receivedRevenueInCents - totals.expensesInCents)
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
