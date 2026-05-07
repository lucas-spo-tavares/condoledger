import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { ensureCognitoUserForEmail } from "@/lib/cognito";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://condoledger:condoledger@localhost:5432/condoledger?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  const residents = await prisma.resident.findMany({
    where: {
      email: {
        not: null
      }
    },
    select: {
      email: true
    }
  });

  let synced = 0;

  for (const resident of residents) {
    if (!resident.email) {
      continue;
    }

    await ensureCognitoUserForEmail({
      email: resident.email
    });
    synced += 1;
  }

  console.log(`Synced ${synced} Cognito users from residents with e-mail.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
