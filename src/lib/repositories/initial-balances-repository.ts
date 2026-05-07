import "server-only";

import { toDateOnlyString } from "@/lib/mappers/dates";
import { prisma } from "@/lib/db/prisma";
import type { InitialBalance } from "@/types/domain";

export async function findInitialBalances(): Promise<InitialBalance[]> {
  const initialBalances = await prisma.initialBalance.findMany({
    orderBy: {
      month: "asc"
    }
  });

  return initialBalances.map((initialBalance) => ({
    id: initialBalance.id,
    month: toDateOnlyString(initialBalance.month),
    description: initialBalance.description,
    amountInCents: initialBalance.amountInCents
  }));
}
