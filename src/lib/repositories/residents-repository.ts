import "server-only";

import { prisma } from "@/lib/db/prisma";
import { mapResident } from "@/lib/repositories/mappers";
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

  return residents.map(mapResident);
}

export async function findResidentById(id: string) {
  const resident = await prisma.resident.findUnique({
    include: residentInclude,
    where: { id }
  });

  return resident ? mapResident(resident) : null;
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

  return resident ? mapResident(resident) : null;
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
      status: resident.status,
      isAdministrator: resident.isAdministrator
    },
    update: {
      name: resident.name,
      email: resident.email ?? null,
      unit: resident.unit,
      residentTypeId: resident.residentTypeId,
      monthlyContributionInCents: resident.monthlyContributionInCents,
      status: resident.status,
      isAdministrator: resident.isAdministrator
    }
  });

  return mapResident(persistedResident);
}

export async function inactivateResident(id: string) {
  const resident = await prisma.resident.update({
    include: residentInclude,
    where: { id },
    data: {
      status: "inactive"
    }
  });

  return mapResident(resident);
}
