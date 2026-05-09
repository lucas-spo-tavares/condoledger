import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { expenseSchema } from "@/lib/schemas/expenses/expense-schema";
import { getCurrentUserFromRequest } from "@/lib/servers/current-user";
import { deleteExpense, getExpense, getExpenses, putExpense } from "@/lib/servers/expenses";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  if (id) {
    return NextResponse.json(await getExpense(id));
  }

  return NextResponse.json(await getExpenses({ month, q }));
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser?.isAdministrator) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("multipart/form-data") ? await request.formData() : null;
  const payload = formData ? formData.get("payload") : await request.json();

  let parsedPayload: unknown;

  try {
    parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch {
    return NextResponse.json({ message: "invalid expense payload" }, { status: 400 });
  }

  const result = expenseSchema.safeParse(parsedPayload);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid expense",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putExpense(result.data, formData ?? undefined));
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

  return NextResponse.json(await deleteExpense(id));
}
