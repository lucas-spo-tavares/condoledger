import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { receiptSchema } from "@/lib/schemas/receipts/receipt-schema";
import { deleteReceipt, getReceipts, putReceipt } from "@/lib/servers/receipts";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  return NextResponse.json(await getReceipts({ month, q }));
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
