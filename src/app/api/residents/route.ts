import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { residentSchema } from "@/lib/schemas/residents/resident-schema";
import { deleteResident, getResidents, putResident } from "@/lib/servers/residents";

export async function GET() {
  return NextResponse.json(await getResidents());
}

export async function PUT(request: NextRequest) {
  const result = residentSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid resident",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putResident(result.data));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteResident(id));
}
