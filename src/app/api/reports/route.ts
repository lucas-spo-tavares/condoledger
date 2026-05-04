import { NextResponse } from "next/server";

import { getReports } from "@/lib/servers/reports";

export async function GET() {
  return NextResponse.json(await getReports());
}
