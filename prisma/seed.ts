import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { expenses, initialBalances, receipts, residents } from "../scripts/seed-data";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://condoledger:condoledger@localhost:5432/condoledger?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const defaultResidentTypeLabels = ["Morador", "Loja", "Igreja", "Predio"];

function toTimestamp(value: string) {
  return new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
}

function toMonthDate(value: string) {
  return new Date(`${value.slice(0, 7)}-01T00:00:00.000Z`);
}

async function main() {
  await prisma.$transaction([
    prisma.attachment.deleteMany(),
    prisma.receipt.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.initialBalance.deleteMany(),
    prisma.resident.deleteMany(),
    prisma.residentType.deleteMany()
  ]);

  for (const label of defaultResidentTypeLabels) {
    await prisma.residentType.create({
      data: {
        label,
        active: true
      }
    });
  }

  const residentTypes = await prisma.residentType.findMany();
  const residentTypeIdByLabel = new Map(residentTypes.map((residentType) => [residentType.label, residentType.id]));

  for (const resident of residents) {
    const residentTypeId = residentTypeIdByLabel.get(resident.residentTypeLabel);

    if (!residentTypeId) {
      throw new Error(`Missing resident type "${resident.residentTypeLabel}" for ${resident.name}.`);
    }

    await prisma.resident.create({
      data: {
        id: resident.id,
        name: resident.name,
        email: resident.email ?? null,
        unit: resident.unit,
        residentTypeId,
        monthlyContributionInCents: resident.monthlyContributionInCents,
        status: resident.status,
        createdAt: toTimestamp(resident.createdAt)
      }
    });
  }

  for (const receipt of receipts) {
    await prisma.receipt.create({
      data: {
        id: receipt.id,
        residentId: receipt.residentId,
        month: toMonthDate(receipt.month),
        description: receipt.description ?? null,
        amountInCents: receipt.amountInCents,
        receivedAt: toTimestamp(receipt.receivedAt)
      }
    });
  }

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        id: expense.id,
        month: toMonthDate(expense.month),
        category: expense.category,
        description: expense.description,
        amountInCents: expense.amountInCents,
        paidAt: toTimestamp(expense.paidAt)
      }
    });
  }

  for (const initialBalance of initialBalances) {
    await prisma.initialBalance.create({
      data: {
        month: toMonthDate(initialBalance.month),
        description: initialBalance.description,
        amountInCents: initialBalance.amountInCents
      }
    });
  }

  console.log(
    `Seeded PostgreSQL database (resident types: ${defaultResidentTypeLabels.length}, residents: ${residents.length}, receipts: ${receipts.length}, expenses: ${expenses.length}, initial balances: ${initialBalances.length}).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
