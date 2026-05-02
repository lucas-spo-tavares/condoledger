import { NextRequest, NextResponse } from "next/server";

import { deleteReport, getReports, putReport } from "@/lib/serves/reports";

export async function GET() {
  return NextResponse.json(await getReports());
}

export async function PUT(request: NextRequest) {
  const report = await request.json();

  return NextResponse.json(await putReport(report));
}

export async function DELETE(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  if (!month) {
    return NextResponse.json({ message: "month is required" }, { status: 400 });
  }

  return NextResponse.json(await deleteReport(month));
}
