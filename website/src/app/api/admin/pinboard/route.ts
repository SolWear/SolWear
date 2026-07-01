import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ideas = db()
    .prepare("SELECT id, username, idea, status, created_at FROM pinboard_ideas ORDER BY id DESC LIMIT 200")
    .all();
  return NextResponse.json({ ideas });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { id?: number } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  db().prepare("DELETE FROM pinboard_ideas WHERE id = ?").run(body.id);
  return NextResponse.json({ success: true });
}

function isAdmin(request: NextRequest): boolean {
  const token = process.env.PINBOARD_ADMIN_TOKEN;
  const session = getSession(request);
  return Boolean(session?.isAdmin || (token && request.headers.get("x-admin-token") === token));
}
