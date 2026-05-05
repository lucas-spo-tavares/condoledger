import "server-only";

import { confirmEmailOtpSignIn, startEmailOtpSignIn } from "@/lib/cognito";
import { getResidentByEmail, getResidentById } from "@/lib/servers/residents";
import type { CurrentUser } from "@/types/domain";

const SESSION_COOKIE_NAME = "condoledger_user";
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const AUTH_MODE = process.env.AUTH_MODE ?? "cognito";
const localOtpSessions = new Map<string, { code: string; email: string; expiresAt: number }>();
const LOCAL_CURRENT_USER: CurrentUser = {
  id: "local-user",
  name: "Local User",
  email: "local@condoledger.local",
  unit: "Local",
  residentTypeLabel: "Morador",
  isAdministrator: false
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
  const resident = await requireActiveResident(email);

  if (isLocalAuthMode()) {
    return {
      currentUser: LOCAL_CURRENT_USER,
      email: resident.email ?? email
    };
  }

  try {
    const response = await startEmailOtpSignIn(resident.email ?? email);
    const session = response.Session;

    if (!session) {
      throw new Error("Cognito did not return a session.");
    }

    return {
      session: `cognito:${session}`,
      email: resident.email ?? email,
      maskedDestination: maskEmail(resident.email ?? email)
    };
  } catch {
    const session = `local:${crypto.randomUUID()}`;
    const code = createOtpCode();

    localOtpSessions.set(session, {
      code,
      email: resident.email ?? email,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    return {
      session,
      email: resident.email ?? email,
      maskedDestination: maskEmail(resident.email ?? email)
    };
  }
}

export async function confirmOtpSignIn(params: { email: string; code: string; session: string }) {
  const resident = await requireActiveResident(params.email);

  if (isLocalAuthMode()) {
    return LOCAL_CURRENT_USER;
  }

  if (params.session.startsWith("local:")) {
    const localSession = localOtpSessions.get(params.session);

    if (!localSession) {
      throw new AuthError("Código expirado. Solicite um novo OTP.", 410);
    }

    if (localSession.email.trim().toLowerCase() !== params.email.trim().toLowerCase()) {
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
    return buildCurrentUser(resident);
  }

  const rawSession = params.session.startsWith("cognito:") ? params.session.slice("cognito:".length) : params.session;
  try {
    await confirmEmailOtpSignIn({
      email: resident.email ?? params.email,
      code: params.code,
      session: rawSession
    });
  } catch {
    throw new AuthError("Código inválido.", 400);
  }

  return buildCurrentUser(resident);
}

export async function getCurrentUserFromResidentId(residentId: string | undefined): Promise<CurrentUser | null> {
  if (isLocalAuthMode()) {
    return getLocalCurrentUser();
  }

  if (residentId) {
    const resident = await getResidentById(residentId);

    if (resident && resident.status === "active") {
      return buildCurrentUser(resident);
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

function buildCurrentUser(resident: NonNullable<ResidentLookup>) {
  if (!resident.email) {
    throw new AuthError("Morador sem e-mail cadastrado.", 403);
  }

  return {
    id: resident.id,
    name: resident.name,
    email: resident.email,
    unit: resident.unit,
    residentTypeLabel: resident.residentTypeLabel,
    isAdministrator: resident.isAdministrator
  } satisfies CurrentUser;
}

async function requireActiveResident(email: string) {
  const resident = await getResidentByEmail(email);

  if (!resident) {
    throw new AuthError("Nenhum morador cadastrado com este e-mail.", 404);
  }

  if (resident.status !== "active") {
    throw new AuthError("Apenas moradores ativos podem acessar a aplicação.", 403);
  }

  if (!resident.email) {
    throw new AuthError("Morador sem e-mail cadastrado.", 403);
  }

  return resident;
}

function createOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
