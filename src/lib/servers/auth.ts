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
import { SIGN_IN_OTP_LENGTH } from "@/lib/schemas/auth/sign-in-schema";
import { getResidentByEmail, getResidentById } from "@/lib/servers/residents";
import type { CurrentUser } from "@/types/domain";

const SESSION_COOKIE_NAME = "condoledger_user";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const AUTH_MODE = process.env.AUTH_MODE ?? "cognito";
const localOtpSessions = new Map<string, { code: string; email: string; expiresAt: number }>();
const RESIDENT_SESSION_PREFIX = "resident:";
const EXTERNAL_SESSION_PREFIX = "external:";
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
      maskedDestination: string;
      session: string;
    }
  | {
      currentUser: CurrentUser;
      email: string;
      maskedDestination?: string;
      session?: string;
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
      currentUser: LOCAL_CURRENT_USER,
      sessionToken: getCurrentUserSessionToken(LOCAL_CURRENT_USER.id)
    };
  }

  if (params.session.startsWith("local:")) {
    const localSession = localOtpSessions.get(params.session);

    if (!localSession) {
      throw new AuthError("Código expirado. Solicite um novo OTP.", 410);
    }

    if (localSession.email.trim().toLowerCase() !== normalizedEmail) {
      throw new AuthError("Código inválido.", 400);
    }

    if (localSession.expiresAt < Date.now()) {
      localOtpSessions.delete(params.session);
      throw new AuthError("Código expirado. Solicite um novo OTP.", 410);
    }

    if (localSession.code !== params.code) {
      throw new AuthError("Código inválido.", 400);
    }

    localOtpSessions.delete(params.session);
    if (resident) {
      if (resident.status !== "active") {
        throw new AuthError("Apenas moradores ativos podem acessar a aplicação.", 403);
      }

      if (!resident.email) {
        throw new AuthError("Morador sem e-mail cadastrado.", 403);
      }

      return {
        currentUser: await buildCurrentUser(resident),
        sessionToken: getCurrentUserSessionToken(resident.id)
      };
    }

    return {
      currentUser: await buildExternalCurrentUser(normalizedEmail),
      sessionToken: getCurrentUserSessionToken(normalizedEmail, "external")
    };
  }

  const rawSession = params.session.startsWith("cognito:") ? params.session.slice("cognito:".length) : params.session;
  try {
    await confirmEmailOtpSignIn({
      email: resident?.email ?? normalizedEmail,
      code: params.code,
      session: rawSession
    });
  } catch {
    throw new AuthError("Código inválido.", 400);
  }

  if (resident) {
    if (resident.status !== "active") {
      throw new AuthError("Apenas moradores ativos podem acessar a aplicação.", 403);
    }

    if (!resident.email) {
      throw new AuthError("Morador sem e-mail cadastrado.", 403);
    }

    return {
      currentUser: await buildCurrentUser(resident),
      sessionToken: getCurrentUserSessionToken(resident.id)
    };
  }

  return {
    currentUser: await buildExternalCurrentUser(normalizedEmail),
    sessionToken: getCurrentUserSessionToken(normalizedEmail, "external")
  };
}

export async function getCurrentUserFromResidentId(residentId: string | undefined): Promise<CurrentUser | null> {
  return getCurrentUserFromSessionToken(residentId);
}

export async function getCurrentUserFromSessionToken(sessionToken: string | undefined): Promise<CurrentUser | null> {
  if (isLocalAuthMode()) {
    return getLocalCurrentUser();
  }

  if (!sessionToken) {
    return null;
  }

  if (sessionToken.startsWith(EXTERNAL_SESSION_PREFIX)) {
    const email = sessionToken.slice(EXTERNAL_SESSION_PREFIX.length).trim().toLowerCase();

    if (!email) {
      return null;
    }

    return await buildExternalCurrentUser(email);
  }

  const residentId = sessionToken.startsWith(RESIDENT_SESSION_PREFIX)
    ? sessionToken.slice(RESIDENT_SESSION_PREFIX.length)
    : sessionToken;

  if (residentId) {
    const resident = await getResidentById(residentId);

    if (resident && resident.status === "active") {
      return await buildCurrentUser(resident);
    }
  }

  return null;
}

export async function getLocalCurrentUser() {
  if (!isLocalAuthMode()) {
    return null;
  }

  return LOCAL_CURRENT_USER;
}

export function getCurrentUserCookieName() {
  return SESSION_COOKIE_NAME;
}

async function buildCurrentUser(resident: NonNullable<ResidentLookup>) {
  if (!resident.email) {
    throw new AuthError("Morador sem e-mail cadastrado.", 403);
  }

  const isAdministrator = await isCognitoUserInGroupByEmail(resident.email);

  return {
    id: resident.id,
    name: resident.name,
    email: resident.email,
    unit: resident.unit,
    residentTypeLabel: resident.residentTypeLabel,
    isAdministrator
  } satisfies CurrentUser;
}

async function buildExternalCurrentUser(email: string): Promise<CurrentUser> {
  const isAdministrator = await isCognitoUserInGroupByEmail(email);

  return {
    id: email,
    name: "Usuário externo",
    email,
    unit: "Externo",
    residentTypeLabel: "Externo",
    isAdministrator
  };
}

function createOtpCode() {
  const min = 10 ** (SIGN_IN_OTP_LENGTH - 1);
  const max = 10 ** SIGN_IN_OTP_LENGTH;

  return Math.floor(min + Math.random() * (max - min)).toString();
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function isLocalAuthMode() {
  return AUTH_MODE.toLowerCase() === "local";
}

function getCurrentUserSessionToken(id: string, kind: "resident" | "external" = "resident") {
  return `${kind === "resident" ? RESIDENT_SESSION_PREFIX : EXTERNAL_SESSION_PREFIX}${id}`;
}

async function startCognitoOtp(email: string): Promise<StartOtpSignInResult> {
  const response = await startEmailOtpSignIn(email);
  const session = response.Session;

  if (!session) {
    throw new Error("Cognito did not return a session.");
  }

  return {
    session: `cognito:${session}`,
    email,
    maskedDestination: maskEmail(email)
  };
}
