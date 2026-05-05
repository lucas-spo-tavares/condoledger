import { request } from "@/lib/commons/request";
import type { ResidentType } from "@/types/domain";

export async function getResidentTypes() {
  return request<ResidentType[]>("/api/resident-types");
}
