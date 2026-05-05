import { NextResponse } from "next/server";

import { getResidentTypes } from "@/lib/servers/resident-types";

export async function GET() {
  return NextResponse.json(await getResidentTypes());
}
