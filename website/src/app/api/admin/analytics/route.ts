import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { summary } from "@/lib/server/analytics";
import { communityCount } from "@/lib/server/community";
import { waitlistCount } from "@/lib/server/waitlist";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const days = Math.min(365, Math.max(1, Number(request.nextUrl.searchParams.get("days") ?? 30) || 30));
  return NextResponse.json({
    analytics: summary(days),
    totals: { waitlist: waitlistCount(), community: communityCount() },
  });
}
