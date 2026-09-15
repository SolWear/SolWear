import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin, requireAdminMutation } from "@/lib/server/admin";
import { rateLimit } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = authorize(request, false);
  if (denied) return denied;
  const ideas = db()
    .prepare("SELECT id, username, idea, status, created_at FROM pinboard_ideas ORDER BY id DESC LIMIT 200")
    .all();
  return NextResponse.json({ ideas });
}

export async function POST(request: NextRequest) {
  const denied = authorize(request, true);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as {
    id?: number;
    status?: string;
    action?: string;
    x_user_id?: string;
  } | null;

  if (body?.action === "reset_limit") {
    if (!body.x_user_id) return NextResponse.json({ error: "Missing x_user_id" }, { status: 400 });
    const result = db().prepare("DELETE FROM pinboard_ideas WHERE x_user_id = ?").run(body.x_user_id);
    return NextResponse.json({ success: true, deleted: result.changes });
  }

  if (!body?.id || !["approved", "rejected", "pending", "made"].includes(body.status || "")) {
    return NextResponse.json({ error: "Invalid moderation request" }, { status: 400 });
  }
  db().prepare("UPDATE pinboard_ideas SET status = ?, moderated_at = ? WHERE id = ?").run(
    body.status,
    new Date().toISOString(),
    body.id,
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const denied = authorize(request, true);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as { id?: number } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  db().prepare("DELETE FROM pinboard_ideas WHERE id = ?").run(body.id);
  return NextResponse.json({ success: true });
}

function validApiToken(request: NextRequest): boolean {
  const expected = process.env.PINBOARD_ADMIN_TOKEN?.trim();
  const supplied = request.headers.get("x-admin-token") ?? "";
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function authorize(request: NextRequest, mutation: boolean): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`admin-pinboard:${ip}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (validApiToken(request)) return null;
  const { response } = mutation ? requireAdminMutation(request) : requireAdmin(request);
  return response;
}
