import "server-only";

import {
  ensureCognitoUserForEmail,
  syncCognitoAdminGroupMembership,
  syncCognitoResidentGroupMembership
} from "@/lib/cognito";
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
  const existingResident = resident.id ? await findResidentById(resident.id) : null;
  if (resident.isAdministrator && !resident.email?.trim()) {
    throw new Error("Morador administrador precisa ter e-mail cadastrado.");
  }

  const persistedResident = await upsertResident(resident);

  if (persistedResident.email) {
    await ensureCognitoUserForEmail({
      email: persistedResident.email,
      previousEmail: existingResident?.email
    });
    await syncCognitoResidentGroupMembership(persistedResident.email);
  }

  await syncCognitoAdminGroupMembership({
    email: persistedResident.email,
    previousEmail: existingResident?.email,
    isAdministrator: resident.isAdministrator
  });

  return persistedResident;
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
