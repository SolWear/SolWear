import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.json({ user: getSession(request) });
}
