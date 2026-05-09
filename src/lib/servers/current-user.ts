import "server-only";

import { cookies } from "next/headers";

import { getCurrentUserCookieName, getCurrentUserFromSessionToken } from "@/lib/servers/auth";
import type { CurrentUser } from "@/types/domain";

export async function getCurrentUserFromRequest() {
  const cookieStore = await cookies();

  return getCurrentUserFromSessionToken(cookieStore.get(getCurrentUserCookieName())?.value);
}

export function isExternalUser(currentUser: CurrentUser | null) {
  return currentUser?.residentTypeLabel === "Externo";
}

export function canAccessPortalReceipts(currentUser: CurrentUser | null) {
  return Boolean(currentUser && (currentUser.isAdministrator || !isExternalUser(currentUser)));
}
