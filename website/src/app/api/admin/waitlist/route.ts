import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminMutation } from "@/lib/server/admin";
import { deleteWaitlistEntry, duplicateEmails, listWaitlist, waitlistCount, waitlistCsv } from "@/lib/server/waitlist";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(waitlistCsv(), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="solwear-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset") ?? 0) || 0);
  return NextResponse.json({
    entries: listWaitlist(200, offset),
    total: waitlistCount(),
    duplicates: duplicateEmails(),
  });
}

export async function DELETE(request: NextRequest) {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  return NextResponse.json({ ok: deleteWaitlistEntry(id) });
}
