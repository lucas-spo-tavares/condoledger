import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { signInStartSchema } from "@/lib/schemas/auth/sign-in-schema";
import { AuthError, startOtpSignIn } from "@/lib/servers/auth";

export async function POST(request: NextRequest) {
  const result = signInStartSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid sign in request",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await startOtpSignIn(result.data.email));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Nao foi possivel enviar o codigo." }, { status: 500 });
  }
}
