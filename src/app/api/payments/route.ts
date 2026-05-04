import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { receiptSchema } from "@/lib/schemas/payments/payment-schema";
import { deleteReceipt, getReceipts, putReceipt } from "@/lib/servers/payments";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const rawStatus = request.nextUrl.searchParams.get("status");
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = rawStatus === "pending" || rawStatus === "confirmed" || rawStatus === "voided" ? rawStatus : undefined;

  return NextResponse.json(await getReceipts({ month, q, status }));
}

export async function PUT(request: NextRequest) {
  const result = receiptSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid receipt",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putReceipt(result.data));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteReceipt(id));
}
