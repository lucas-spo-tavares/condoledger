import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { expenseSchema } from "@/lib/schemas/expenses/expense-schema";
import { deleteExpense, getExpenses, putExpense } from "@/lib/serves/expenses";

export async function GET() {
  return NextResponse.json(await getExpenses());
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
