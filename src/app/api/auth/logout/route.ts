import { NextResponse } from "next/server";

import { getCurrentUserCookieName } from "@/lib/servers/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getCurrentUserCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
