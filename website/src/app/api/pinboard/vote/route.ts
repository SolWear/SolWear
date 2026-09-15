import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession, verifyCsrfToken } from "@/lib/server/session";
import { getCommunityUser } from "@/lib/server/community";
import { sameOrigin } from "@/lib/server/admin";
import { rateLimit } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const member = getCommunityUser(session.id);
  if (!session.isAdmin && member?.status !== "active") {
    return NextResponse.json({ error: "Community account is not active" }, { status: 403 });
  }
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!verifyCsrfToken(session, request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`vote:ip:${ip}`, 120, 10 * 60 * 1000) || !rateLimit(`vote:account:${session.id}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many votes. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { idea_id?: number } | null;
  const ideaId = body?.idea_id;
  if (!Number.isSafeInteger(ideaId) || !ideaId || ideaId <= 0) {
    return NextResponse.json({ error: "Invalid idea_id" }, { status: 400 });
  }
  const idea = db().prepare("SELECT id FROM pinboard_ideas WHERE id = ? AND status = 'approved'").get(ideaId);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const existing = db()
    .prepare("SELECT id FROM idea_votes WHERE idea_id = ? AND x_user_id = ?")
    .get(ideaId, session.id);

  if (existing) {
    db().prepare("DELETE FROM idea_votes WHERE idea_id = ? AND x_user_id = ?").run(ideaId, session.id);
  } else {
    db().prepare("INSERT INTO idea_votes (idea_id, x_user_id, created_at) VALUES (?, ?, ?)").run(
      ideaId, session.id, new Date().toISOString(),
    );
  }

  const { count } = db()
    .prepare("SELECT COUNT(*) AS count FROM idea_votes WHERE idea_id = ?")
    .get(ideaId) as { count: number };

  return NextResponse.json({ votes: count, userVoted: !existing });
}
