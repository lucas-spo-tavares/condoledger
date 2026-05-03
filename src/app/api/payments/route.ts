import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { paymentSchema } from "@/lib/schemas/payments/payment-schema";
import { deletePayment, getPayments, putPayment } from "@/lib/servers/payments";

export async function GET() {
  return NextResponse.json(await getPayments());
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
