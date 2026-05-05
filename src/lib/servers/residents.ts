import "server-only";

import {
  findResidentByEmail,
  findResidentById,
  findResidents,
  inactivateResident,
  upsertResident
} from "@/lib/repositories/residents-repository";
import type { ResidentStatus, ResidentUpsert } from "@/types/domain";

export async function getResidents(filters?: { q?: string; status?: ResidentStatus }) {
  return findResidents(filters);
}

export async function putResident(resident: ResidentUpsert) {
  return upsertResident(resident);
}

export async function deleteResident(id: string) {
  const resident = await findResidentById(id);

  if (!resident) {
    return { id };
  }

  await inactivateResident(id);
  return { id };
}

export async function getResidentById(id: string) {
  return findResidentById(id);
}

export async function getResidentByEmail(email: string) {
  return findResidentByEmail(email);
}
