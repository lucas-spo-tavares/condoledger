import "server-only";

import {
  confirmEmailOtpSignIn,
  ensureCognitoUserForEmail,
  findCognitoUserByEmail,
  isCognitoUserInGroupByEmail,
  normalizeEmail,
  startEmailOtpSignIn,
  syncCognitoResidentGroupMembership
} from "@/lib/cognito";
import { getResidentByEmail } from "@/lib/servers/residents";
import type { CurrentUser } from "@/types/domain";

const SESSION_COOKIE_NAME = "condoledger_user";
const ACCESS_TOKEN_COOKIE_NAME = "condoledger_access";
const ID_TOKEN_COOKIE_NAME = "condoledger_id";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const AUTH_MODE = process.env.AUTH_MODE ?? "cognito";
const LOCAL_CURRENT_USER: CurrentUser = {
  id: "local-user",
  name: "Local User",
  email: "local@condoledger.local",
  unit: "Local",
  residentTypeLabel: "Morador",
  isAdministrator: true
};

type ResidentLookup = Awaited<ReturnType<typeof getResidentByEmail>>;
type StartOtpSignInResult =
  | {
      email: string;
      session: string;
    }
  | {
      currentUser: CurrentUser;
      email: string;
      session?: string;
    };
export type CognitoTokenSet = {
  accessToken: string;
  idToken: string;
  expiresIn: number;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function startOtpSignIn(email: string): Promise<StartOtpSignInResult> {
  const normalizedEmail = normalizeEmail(email);
  const resident = await getResidentByEmail(normalizedEmail);

  if (isLocalAuthMode()) {
    return {
      currentUser: LOCAL_CURRENT_USER,
      email: resident?.email ?? normalizedEmail
    };
  }

  if (resident) {
    if (resident.status !== "active") {
      throw new AuthError("Apenas moradores ativos podem acessar a aplicação.", 403);
    }

    if (!resident.email) {
      throw new AuthError("Morador sem e-mail cadastrado.", 403);
    }

    await ensureCognitoUserForEmail({
      email: resident.email,
      previousEmail: resident.email
    });
    await syncCognitoResidentGroupMembership(resident.email);

    return startCognitoOtp(resident.email);
  }

  const cognitoUser = await findCognitoUserByEmail(normalizedEmail);

  if (!cognitoUser) {
    throw new AuthError("Nenhum usuário Cognito cadastrado com este e-mail.", 404);
  }

  await syncCognitoResidentGroupMembership(normalizedEmail);

  return startCognitoOtp(normalizedEmail);
}

export async function confirmOtpSignIn(params: { email: string; code: string; session: string }) {
  const normalizedEmail = normalizeEmail(params.email);
  const resident = await getResidentByEmail(normalizedEmail);

  if (isLocalAuthMode()) {
    return {
      currentUser: LOCAL_CURRENT_USER
    };
  }

  const rawSession = params.session.startsWith("cognito:") ? params.session.slice("cognito:".length) : params.session;
  let authResponse: Awaited<ReturnType<typeof confirmEmailOtpSignIn>>;

  try {
    authResponse = await confirmEmailOtpSignIn({
      email: resident?.email ?? normalizedEmail,
      code: params.code,
      session: rawSession
    });
  } catch {
    throw new AuthError("Código inválido.", 400);
  }

  const tokens = getCognitoTokenSet(authResponse.AuthenticationResult);

  if (!tokens) {
    throw new AuthError("Cognito nao retornou tokens de acesso.", 500);
  }

  const isAdministrator = await isCognitoUserInGroupByEmail(resident?.email ?? normalizedEmail);

  if (resident) {
    if (resident.status !== "active") {
      throw new AuthError("Apenas moradores ativos podem acessar a aplicação.", 403);
    }

    if (!resident.email) {
      throw new AuthError("Morador sem e-mail cadastrado.", 403);
    }

    return {
      currentUser: mapResidentToCurrentUser(resident, isAdministrator),
      tokens
    };
  }

  return {
    currentUser: buildExternalCurrentUserFromAuthorization(normalizedEmail, isAdministrator),
    tokens
  };
}

export async function getLocalCurrentUser() {
  if (!isLocalAuthMode()) {
    return null;
  }

  return LOCAL_CURRENT_USER;
}

export function getCurrentUserCookieName() {
  return ACCESS_TOKEN_COOKIE_NAME;
}

export function getCurrentUserIdTokenCookieName() {
  return ID_TOKEN_COOKIE_NAME;
}

export function getLegacyCurrentUserCookieName() {
  return SESSION_COOKIE_NAME;
}

export function mapResidentToCurrentUser(resident: NonNullable<ResidentLookup>, isAdministrator: boolean) {
  if (!resident.email) {
    throw new AuthError("Morador sem e-mail cadastrado.", 403);
  }

  return {
    id: resident.id,
    name: resident.name,
    email: resident.email,
    unit: resident.unit,
    residentTypeLabel: resident.residentTypeLabel,
    isAdministrator
  } satisfies CurrentUser;
}

export function buildExternalCurrentUserFromAuthorization(email: string, isAdministrator: boolean): CurrentUser {
  const normalizedEmail = normalizeEmail(email);

  return {
    id: normalizedEmail,
    name: "Usuário externo",
    email: normalizedEmail,
    unit: "Externo",
    residentTypeLabel: "Externo",
    isAdministrator
  };
}

function getCognitoTokenSet(authenticationResult: Awaited<ReturnType<typeof confirmEmailOtpSignIn>>["AuthenticationResult"]) {
  if (!authenticationResult?.AccessToken || !authenticationResult.IdToken) {
    return null;
  }

  return {
    accessToken: authenticationResult.AccessToken,
    idToken: authenticationResult.IdToken,
    expiresIn: authenticationResult.ExpiresIn ?? SESSION_COOKIE_MAX_AGE_SECONDS
  } satisfies CognitoTokenSet;
}

function isLocalAuthMode() {
  return AUTH_MODE.toLowerCase() === "local";
}

async function startCognitoOtp(email: string): Promise<StartOtpSignInResult> {
  const response = await startEmailOtpSignIn(email);
  const session = response.Session;

  if (!session) {
    throw new Error("Cognito did not return a session.");
  }

  return {
    session: `cognito:${session}`,
    email
  };
}
