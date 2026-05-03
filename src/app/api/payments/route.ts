import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { paymentSchema } from "@/lib/schemas/payments/payment-schema";
import { deletePayment, getPayments, putPayment } from "@/lib/servers/payments";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const rawStatus = request.nextUrl.searchParams.get("status");
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = rawStatus === "pending" || rawStatus === "confirmed" || rawStatus === "voided" ? rawStatus : undefined;

  return NextResponse.json(await getPayments({ month, q, status }));
}

export async function PUT(request: NextRequest) {
  const result = paymentSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid payment",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putPayment(result.data));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deletePayment(id));
}
