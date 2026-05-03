import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { expenseSchema } from "@/lib/schemas/expenses/expense-schema";
import { deleteExpense, getExpenses, putExpense } from "@/lib/servers/expenses";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  return NextResponse.json(await getExpenses({ month, q }));
}

export async function PUT(request: NextRequest) {
  const result = expenseSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid expense",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putExpense(result.data));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteExpense(id));
}
