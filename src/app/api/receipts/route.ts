import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { receiptSchema } from "@/lib/schemas/receipts/receipt-schema";
import { deleteReceipt, getReceipt, getReceipts, putReceipt } from "@/lib/servers/receipts";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  if (id) {
    return NextResponse.json(await getReceipt(id));
  }

  return NextResponse.json(await getReceipts({ month, q }));
}

export async function PUT(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("multipart/form-data") ? await request.formData() : null;
  const payload = formData ? formData.get("payload") : await request.json();

  let parsedPayload: unknown;

  try {
    parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch {
    return NextResponse.json({ message: "invalid receipt payload" }, { status: 400 });
  }

  const result = receiptSchema.safeParse(parsedPayload);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid receipt",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putReceipt(result.data, formData ?? undefined));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteReceipt(id));
}
