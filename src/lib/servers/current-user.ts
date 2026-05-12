import "server-only";

import type { Json } from "aws-jwt-verify/safe-json-parse";
import { cookies } from "next/headers";

import { normalizeEmail } from "@/lib/cognito";
import {
  buildExternalCurrentUserFromAuthorization,
  getCurrentUserCookieName,
  getCurrentUserIdTokenCookieName,
  getLocalCurrentUser,
  mapResidentToCurrentUser
} from "@/lib/servers/auth";
import { verifyCognitoAccessToken, verifyCognitoIdToken } from "@/lib/servers/cognito-tokens";
import { getResidentByEmail } from "@/lib/servers/residents";
import type { CurrentUser } from "@/types/domain";

export async function getCurrentUserFromRequest() {
  const localCurrentUser = await getLocalCurrentUser();

  if (localCurrentUser) {
    return localCurrentUser;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(getCurrentUserCookieName())?.value;
  const idToken = cookieStore.get(getCurrentUserIdTokenCookieName())?.value;

  if (!accessToken || !idToken) {
    return null;
  }

  try {
    const [accessPayload, idPayload] = await Promise.all([
      verifyCognitoAccessToken(accessToken),
      verifyCognitoIdToken(idToken)
    ]);

    if (accessPayload.sub !== idPayload.sub) {
      return null;
    }

    const email = getStringClaim(idPayload.email) ?? getUsernameEmail(accessPayload.username);

    if (!email) {
      return null;
    }

    const isAdministrator = getStringArrayClaim(accessPayload["cognito:groups"]).includes("Admins");
    const resident = await getResidentByEmail(normalizeEmail(email));

    if (resident) {
      return resident.status === "active" ? mapResidentToCurrentUser(resident, isAdministrator) : null;
    }

    return buildExternalCurrentUserFromAuthorization(email, isAdministrator);
  } catch {
    return null;
  }
}

export function isExternalUser(currentUser: CurrentUser | null) {
  return currentUser?.residentTypeLabel === "Externo";
}

export function canAccessPortalReceipts(currentUser: CurrentUser | null) {
  return Boolean(currentUser && (currentUser.isAdministrator || !isExternalUser(currentUser)));
}

function getStringClaim(value: Json) {
  return typeof value === "string" && value.trim() ? value : null;
}

function getStringArrayClaim(value: readonly string[] | undefined) {
  return value ?? [];
}

function getUsernameEmail(username: string) {
  if (!username.includes("@")) {
    return null;
  }

  return username;
}
