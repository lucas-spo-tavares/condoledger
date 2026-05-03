import { request } from "@/lib/commons/request";
import type { ResidentStatus } from "@/types/domain";
import type { Resident, ResidentUpsert } from "@/types/domain";

export type ResidentQueryParams = {
  q?: string;
  status?: ResidentStatus | "all";
};

export async function getResidents(params?: ResidentQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  const queryString = searchParams.toString();
  return request<Resident[]>(queryString ? `/api/residents?${queryString}` : "/api/residents");
}

export async function putResident(resident: ResidentUpsert) {
  return request<Resident>("/api/residents", {
    method: "PUT",
    body: JSON.stringify(resident)
  });
}

export async function deleteResident(id: string) {
  return request<{ id: string }>(`/api/residents?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
