import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/server/session";
import { sameOrigin } from "@/lib/server/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const response = NextResponse.json({ success: true });
  clearSession(response);
  return response;
}
