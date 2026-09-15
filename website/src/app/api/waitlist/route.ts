import { NextRequest, NextResponse } from "next/server";
import { joinWaitlist, normalizeEmail } from "@/lib/server/waitlist";
import { getSession } from "@/lib/server/session";
import { rateLimit } from "@/lib/server/rateLimit";
import { recordEvent, today, visitorId } from "@/lib/server/analytics";
import { sendWaitlistEmails } from "@/lib/server/mail";
import { verifyTurnstileDetailed } from "@/lib/server/turnstile";

export const runtime = "nodejs";

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!rateLimit(`waitlist:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    turnstile?: string;
    source?: string;
  } | null;

  const email = body?.email ? normalizeEmail(body.email) : null;
  if (!email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const turnstile = await verifyTurnstileDetailed(body?.turnstile ?? "", ip);
  if (!turnstile.ok) {
    if (turnstile.reason === "missing_secret") {
      console.error("[waitlist] TURNSTILE_SECRET_KEY is missing in production");
      return NextResponse.json({ error: "Verification is temporarily unavailable." }, { status: 503 });
    }
    if (turnstile.reason === "upstream_error") {
      return NextResponse.json({ error: "Verification service is unavailable. Try again." }, { status: 503 });
    }
    console.warn("[waitlist] Turnstile rejected submission", {
      reason: turnstile.reason,
      errorCodes: turnstile.errorCodes,
    });
    return NextResponse.json(
      { error: turnstile.reason === "missing_token" ? "Complete the verification check first." : "Verification failed. Refresh and try again." },
      { status: 400 },
    );
  }

  // A signed-in visitor gets their X account linked to the same record.
  const session = getSession(request);

  try {
    const { created, entry } = joinWaitlist({
      email,
      source: body?.source ?? "site",
      referrer: request.headers.get("referer"),
      xUserId: session?.id ?? null,
      xUsername: session?.username ?? null,
    });

    if (created) {
      recordEvent({
        event: "waitlist_join",
        path: "/api/waitlist",
        visitorId: visitorId(ip, request.headers.get("user-agent") ?? "", today()),
        source: entry.source,
      });
      try {
        await sendWaitlistEmails({
          email: entry.email,
          source: entry.source,
          xUsername: entry.x_username,
        });
      } catch (mailError) {
        console.error("[waitlist] signup saved but email delivery failed:", mailError);
      }
    }

    return NextResponse.json({ created, alreadyJoined: !created });
  } catch (error) {
    if ((error as Error).message === "INVALID_EMAIL") {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    console.error("[waitlist] failed:", error);
    return NextResponse.json({ error: "Could not save your email. Try again." }, { status: 500 });
  }
}
