import { NextResponse } from "next/server";

import { getCurrentUserFromRequest } from "@/lib/servers/current-user";
import { getReports } from "@/lib/servers/reports";

export async function GET() {
  const currentUser = await getCurrentUserFromRequest();

  if (!currentUser) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getReports());
}
