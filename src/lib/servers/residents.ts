import "server-only";

import { residents } from "@/lib/mock-data";
import type { Resident, ResidentStatus, ResidentUpsert } from "@/types/domain";

let residentStore = [...residents];

export async function getResidents(filters?: { q?: string; status?: ResidentStatus }) {
  const search = filters?.q?.trim().toLowerCase();

  return residentStore
    .filter((resident) => {
      const matchesStatus = filters?.status ? resident.status === filters.status : true;
      const matchesSearch = search ? resident.name.toLowerCase().includes(search) : true;

      return matchesStatus && matchesSearch;
    })
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR", { sensitivity: "base" }));
}

export async function putResident(resident: ResidentUpsert) {
  const persistedResident: Resident = {
    ...resident,
    id: resident.id ?? crypto.randomUUID()
  };
  const existingIndex = residentStore.findIndex((item) => item.id === persistedResident.id);

  if (existingIndex >= 0) {
    residentStore[existingIndex] = persistedResident;
    return persistedResident;
  }

  residentStore = [persistedResident, ...residentStore];
  return persistedResident;
}

export async function deleteResident(id: string) {
  residentStore = residentStore.filter((resident) => resident.id !== id);
  return { id };
}

export async function getResidentById(id: string) {
  return residentStore.find((resident) => resident.id === id) ?? null;
}

export async function getResidentByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    residentStore.find((resident) => resident.email?.trim().toLowerCase() === normalizedEmail) ?? null
  );
}
