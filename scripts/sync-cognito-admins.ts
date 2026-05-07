import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { ensureCognitoUserForEmail, syncCognitoAdminGroupMembership } from "@/lib/cognito";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://condoledger:condoledger@localhost:5432/condoledger?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

type ResidentAdminRow = {
  email: string | null;
  isAdministrator: boolean;
};

async function main() {
  const residents = await prisma.$queryRaw<ResidentAdminRow[]>`
    select
      email,
      is_administrator as "isAdministrator"
    from residents
  `;

  let syncedUsers = 0;
  let syncedAdmins = 0;

  for (const resident of residents) {
    if (!resident.email) {
      continue;
    }

    await ensureCognitoUserForEmail({
      email: resident.email
    });
    syncedUsers += 1;

    await syncCognitoAdminGroupMembership({
      email: resident.email,
      isAdministrator: resident.isAdministrator
    });

    if (resident.isAdministrator) {
      syncedAdmins += 1;
    }
  }

  console.log(
    `Synced ${syncedUsers} Cognito users and ${syncedAdmins} admin memberships from existing residents.`
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
