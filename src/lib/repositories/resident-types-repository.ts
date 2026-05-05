import "server-only";

import { prisma } from "@/lib/db/prisma";
import { mapResidentType } from "@/lib/repositories/mappers";

export async function findResidentTypes(filters?: { active?: boolean }) {
  const residentTypes = await prisma.residentType.findMany({
    where: {
      active: filters?.active
    },
    orderBy: {
      label: "asc"
    }
  });

  return residentTypes.map(mapResidentType);
}
