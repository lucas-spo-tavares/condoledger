import { request } from "@/lib/commons/request";
import type { Resident } from "@/types/domain";

export async function getResidents() {
  return request<Resident[]>("/api/residents");
}

export async function putResident(resident: Resident) {
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
