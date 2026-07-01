import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "./session";

export function requireAdmin(request: NextRequest) {
  const session = getSession(request);
  if (!session?.isAdmin) {
    return {
      session,
      response: NextResponse.json({ error: "Admin only" }, { status: 403 }),
    };
  }
  return { session, response: null };
}
