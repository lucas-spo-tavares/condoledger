import { NextRequest, NextResponse } from "next/server";

import { getZodFieldErrors } from "@/lib/commons/zod";
import { reportSchema } from "@/lib/schemas/reports/report-schema";
import { deleteReport, getReports, putReport } from "@/lib/servers/reports";

export async function GET() {
  return NextResponse.json(await getReports());
}

export async function PUT(request: NextRequest) {
  const result = reportSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: "invalid report",
        errors: getZodFieldErrors(result.error)
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await putReport(result.data));
}

export async function DELETE(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  if (!month) {
    return NextResponse.json({ message: "month is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteReport(month));
}
