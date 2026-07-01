import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession, verifyCsrfToken } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  if (!verifyCsrfToken(session, request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { idea_id?: number } | null;
  if (!body?.idea_id) return NextResponse.json({ error: "Missing idea_id" }, { status: 400 });

  const existing = db()
    .prepare("SELECT id FROM idea_votes WHERE idea_id = ? AND x_user_id = ?")
    .get(body.idea_id, session.id);

  if (existing) {
    db().prepare("DELETE FROM idea_votes WHERE idea_id = ? AND x_user_id = ?").run(body.idea_id, session.id);
  } else {
    db().prepare("INSERT INTO idea_votes (idea_id, x_user_id, created_at) VALUES (?, ?, ?)").run(
      body.idea_id, session.id, new Date().toISOString(),
    );
  }

  const { count } = db()
    .prepare("SELECT COUNT(*) AS count FROM idea_votes WHERE idea_id = ?")
    .get(body.idea_id) as { count: number };

  return NextResponse.json({ votes: count, userVoted: !existing });
}
