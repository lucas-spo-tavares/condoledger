import "server-only";

import { mapResidentType } from "@/lib/mappers/resident-types";
import { prisma } from "@/lib/db/prisma";

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
