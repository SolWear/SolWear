import { NextRequest, NextResponse } from "next/server";
import { recordEvent, today, visitorId } from "@/lib/server/analytics";
import { rateLimit } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

const ALLOWED = new Set(["pageview", "waitlist_join", "community_register"]);

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Generous, but enough to stop a single client flooding the table.
  if (!rateLimit(`analytics:${ip}`, 120, 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json().catch(() => null)) as {
    event?: string;
    path?: string;
    source?: string | null;
    referrer?: string | null;
  } | null;

  if (!body?.event || !ALLOWED.has(body.event) || !body.path) {
    return NextResponse.json({ ok: true });
  }

  try {
    recordEvent({
      event: body.event,
      path: body.path,
      visitorId: visitorId(ip, request.headers.get("user-agent") ?? "", today()),
      source: body.source ?? null,
      referrer: body.referrer ?? null,
    });
  } catch (error) {
    console.error("[analytics] failed:", error);
  }
  return NextResponse.json({ ok: true });
}
