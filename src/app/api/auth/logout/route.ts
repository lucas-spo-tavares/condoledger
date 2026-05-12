import { NextResponse } from "next/server";

import {
  getCurrentUserCookieName,
  getCurrentUserIdTokenCookieName,
  getLegacyCurrentUserCookieName
} from "@/lib/servers/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };

  response.cookies.set(getCurrentUserCookieName(), "", cookieOptions);
  response.cookies.set(getCurrentUserIdTokenCookieName(), "", cookieOptions);
  response.cookies.set(getLegacyCurrentUserCookieName(), "", cookieOptions);

  return response;
}
