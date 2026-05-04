import { request } from "@/lib/commons/request";
import type { MonthlyReport } from "@/types/domain";

export async function getReports() {
  return request<MonthlyReport[]>("/api/reports");
}
