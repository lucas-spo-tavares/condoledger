import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { signInConfirmSchema } from "@/lib/schemas/auth/sign-in-schema";
import {
  AuthError,
  confirmOtpSignIn,
  getCurrentUserCookieName,
  getCurrentUserIdTokenCookieName,
  getLegacyCurrentUserCookieName
} from "@/lib/servers/auth";

export async function POST(request: NextRequest) {
  const result = signInConfirmSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid sign in confirmation",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  try {
    const { currentUser, tokens } = await confirmOtpSignIn(result.data);

    const response = NextResponse.json({ currentUser });

    if (tokens) {
      response.cookies.set(getCurrentUserCookieName(), tokens.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: tokens.expiresIn
      });
      response.cookies.set(getCurrentUserIdTokenCookieName(), tokens.idToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: tokens.expiresIn
      });
      response.cookies.set(getLegacyCurrentUserCookieName(), "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0
      });
    }

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Nao foi possivel confirmar o codigo." }, { status: 500 });
  }
}
