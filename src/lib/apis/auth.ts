import type { CurrentUser } from "@/types/domain";

type AuthStartResponse = {
  email: string;
  session?: string;
  maskedDestination?: string;
  currentUser?: CurrentUser;
};

type AuthConfirmResponse = {
  currentUser: CurrentUser;
};

async function parseAuthResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { message?: string } & T;

  if (!response.ok) {
    throw new Error(payload.message ?? "Falha na autenticação.");
  }

  return payload;
}

export async function startAuthOtp(email: string) {
  const response = await fetch("/api/auth/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  return parseAuthResponse<AuthStartResponse>(response);
}

export async function confirmAuthOtp(params: { email: string; code: string; session: string }) {
  const response = await fetch("/api/auth/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });

  return parseAuthResponse<AuthConfirmResponse>(response);
}

export async function logoutAuth() {
  const response = await fetch("/api/auth/logout", {
    method: "POST"
  });

  return parseAuthResponse<{ ok: true }>(response);
}
