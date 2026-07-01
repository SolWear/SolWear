import { NextResponse } from "next/server";
import { clearSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSession(response);
  return response;
}
