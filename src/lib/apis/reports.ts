import { request } from "@/lib/commons/request";
import type { MonthlyReport } from "@/types/domain";

export async function getReports() {
  return request<MonthlyReport[]>("/api/reports");
}

export async function putReport(report: MonthlyReport) {
  return request<MonthlyReport>("/api/reports", {
    method: "PUT",
    body: JSON.stringify(report)
  });
}

export async function deleteReport(month: string) {
  return request<{ month: string }>(`/api/reports?month=${encodeURIComponent(month)}`, {
    method: "DELETE"
  });
}
