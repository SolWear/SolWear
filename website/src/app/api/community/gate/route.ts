import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/server/rateLimit";
import { setGateCookie } from "@/lib/server/session";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";

/** Step 1 of the community gate: prove you're human, get a short-lived pass. */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`gate:${ip}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { turnstile?: string } | null;
  if (!(await verifyTurnstile(body?.turnstile ?? "", ip))) {
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  setGateCookie(response);
  return response;
}
