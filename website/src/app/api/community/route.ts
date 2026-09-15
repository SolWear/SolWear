import { NextRequest, NextResponse } from "next/server";
import { createCsrfToken, getSession, hasGatePass } from "@/lib/server/session";
import { getCommunityUser } from "@/lib/server/community";
import { findByXUserId } from "@/lib/server/waitlist";

export const runtime = "nodejs";

/** Everything the community page needs to decide which step to show. */
export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ user: null, gatePassed: hasGatePass(request), onWaitlist: false });
  }

  const member = getCommunityUser(session.id);
  const waitlistEntry = findByXUserId(session.id);

  return NextResponse.json({
    user: { id: session.id, username: session.username, avatarUrl: session.avatarUrl, isAdmin: session.isAdmin },
    gatePassed: true,
    onWaitlist: Boolean(waitlistEntry),
    email: waitlistEntry?.email ?? null,
    role: member?.role ?? "member",
    status: member?.status ?? "active",
    csrfToken: createCsrfToken(session),
  });
}
