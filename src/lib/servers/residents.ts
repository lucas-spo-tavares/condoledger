import "server-only";

import { residents } from "@/lib/mock-data";
import type { Resident } from "@/types/domain";

let residentStore = [...residents];

export async function getResidents() {
  return residentStore;
}

export async function putResident(resident: Resident) {
  const existingIndex = residentStore.findIndex((item) => item.id === resident.id);

  if (existingIndex >= 0) {
    residentStore[existingIndex] = resident;
    return resident;
  }

  residentStore = [resident, ...residentStore];
  return resident;
}

export async function deleteResident(id: string) {
  residentStore = residentStore.filter((resident) => resident.id !== id);
  return { id };
}
