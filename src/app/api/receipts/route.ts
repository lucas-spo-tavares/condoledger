import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { receiptSchema } from "@/lib/schemas/receipts/receipt-schema";
import { canAccessPortalReceipts, getCurrentUserFromRequest } from "@/lib/servers/current-user";
import { deleteReceipt, getReceipt, getReceipts, putReceipt, reviewReceipt } from "@/lib/servers/receipts";
import type { ReceiptStatus } from "@/types/domain";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") as ReceiptStatus | null;
  const mine = request.nextUrl.searchParams.get("mine") === "true";
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  if (id) {
    const receipt = await getReceipt(id);

    if (!currentUser?.isAdministrator && receipt?.residentId !== currentUser?.id) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }

    return NextResponse.json(receipt);
  }

  return NextResponse.json(
    await getReceipts({
      month,
      q,
      status: status ?? undefined,
      residentId: !currentUser?.isAdministrator || mine ? currentUser?.id : undefined
    })
  );
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  if (!currentUser.isAdministrator && !canAccessPortalReceipts(currentUser)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

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

  const receipt = currentUser.isAdministrator
    ? {
        ...result.data,
        status: result.data.status ?? "confirmed"
      }
    : {
        ...result.data,
        residentId: currentUser.id,
        status: "pending" as const,
        reviewNote: undefined
      };

  return NextResponse.json(await putReceipt(receipt, formData ?? undefined));
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser?.isAdministrator) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const result = receiptReviewSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid receipt review",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await reviewReceipt(result.data.id, result.data.status, result.data.reviewNote));
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser?.isAdministrator) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteReceipt(id));
}

const receiptReviewSchema = receiptSchema.pick({ reviewNote: true }).extend({
  id: z.string().min(1, "Informe o recebimento."),
  status: z.enum(["confirmed", "rejected"])
});
