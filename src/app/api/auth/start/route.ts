import { NextRequest, NextResponse } from "next/server";

import { AuthError, startOtpSignIn } from "@/lib/servers/auth";

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (!email?.trim()) {
    return NextResponse.json({ message: "email is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await startOtpSignIn(email));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Nao foi possivel enviar o codigo." }, { status: 500 });
  }
}
