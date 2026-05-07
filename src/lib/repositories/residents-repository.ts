import "server-only";

import { isCognitoUserInGroupByEmail } from "@/lib/cognito";
import { mapResident } from "@/lib/mappers/residents";
import { prisma } from "@/lib/db/prisma";
import type { ResidentStatus, ResidentUpsert } from "@/types/domain";

const residentInclude = {
  residentType: true
};

export async function findResidents(filters?: { q?: string; status?: ResidentStatus }) {
  const residents = await prisma.resident.findMany({
    include: residentInclude,
    where: {
      status: filters?.status,
      ...(filters?.q
        ? {
            name: {
              contains: filters.q.trim(),
              mode: "insensitive"
            } as const
          }
        : {})
    },
    orderBy: {
      name: "asc"
    }
  });

  return Promise.all(residents.map(async (resident) => mapResident(resident, await isResidentAdministrator(resident.email))));
}

export async function findResidentById(id: string) {
  const resident = await prisma.resident.findUnique({
    include: residentInclude,
    where: { id }
  });

  return resident ? mapResident(resident, await isResidentAdministrator(resident.email)) : null;
}

export async function findResidentByEmail(email: string) {
  const resident = await prisma.resident.findFirst({
    include: residentInclude,
    where: {
      email: {
        equals: email.trim().toLowerCase(),
        mode: "insensitive"
      }
    }
  });

  return resident ? mapResident(resident, await isResidentAdministrator(resident.email)) : null;
}

export async function upsertResident(resident: ResidentUpsert) {
  const persistedResident = await prisma.resident.upsert({
    include: residentInclude,
    where: {
      id: resident.id ?? "00000000-0000-0000-0000-000000000000"
    },
    create: {
      name: resident.name,
      email: resident.email ?? null,
      unit: resident.unit,
      residentTypeId: resident.residentTypeId,
      monthlyContributionInCents: resident.monthlyContributionInCents,
      status: resident.status
    },
    update: {
      name: resident.name,
      email: resident.email ?? null,
      unit: resident.unit,
      residentTypeId: resident.residentTypeId,
      monthlyContributionInCents: resident.monthlyContributionInCents,
      status: resident.status
    }
  });

  return mapResident(persistedResident, await isResidentAdministrator(persistedResident.email));
}

export async function inactivateResident(id: string) {
  const resident = await prisma.resident.update({
    include: residentInclude,
    where: { id },
    data: {
      status: "inactive"
    }
  });

  return mapResident(resident, await isResidentAdministrator(resident.email));
}

async function isResidentAdministrator(email: string | null) {
  if (!email) {
    return false;
  }

  return isCognitoUserInGroupByEmail(email);
}
