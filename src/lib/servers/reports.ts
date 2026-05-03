import "server-only";

import { currentReport } from "@/lib/mock-data";
import type { MonthlyReport } from "@/types/domain";

let reportStore = [currentReport];

export async function getReports() {
  return reportStore;
}

export async function putReport(report: MonthlyReport) {
  const existingIndex = reportStore.findIndex((item) => item.month === report.month);

  if (existingIndex >= 0) {
    reportStore[existingIndex] = report;
    return report;
  }

  reportStore = [report, ...reportStore];
  return report;
}

export async function deleteReport(month: string) {
  reportStore = reportStore.filter((report) => report.month !== month);
  return { month };
}
