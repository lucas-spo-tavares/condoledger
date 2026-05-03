import { NextRequest, NextResponse } from "next/server";

import { AuthError, confirmOtpSignIn, getCurrentUserCookieName } from "@/lib/servers/auth";

export async function POST(request: NextRequest) {
  const { email, code, session } = (await request.json()) as {
    email?: string;
    code?: string;
    session?: string;
  };

  if (!email?.trim() || !code?.trim() || !session?.trim()) {
    return NextResponse.json({ message: "email, code and session are required" }, { status: 400 });
  }

  try {
    const currentUser = await confirmOtpSignIn({
      email,
      code,
      session
    });

    const response = NextResponse.json({ currentUser });
    response.cookies.set(getCurrentUserCookieName(), currentUser.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Nao foi possivel confirmar o codigo." }, { status: 500 });
  }
}
