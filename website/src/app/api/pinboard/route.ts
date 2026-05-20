import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rateLimit";
import { createCsrfToken, getSession, verifyCsrfToken } from "@/lib/server/session";

export const runtime = "nodejs";

const MAX_IDEAS_PER_X_ACCOUNT = 1;

type IdeaRow = {
  id: number;
  username: string;
  idea: string;
  status: string;
  created_at: string;
  votes: number;
  userVoted: number;
};

function cleanIdea(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function accountStats(xUserId: string, isAdmin = false): { submitted: number; remaining: number } {
  const submitted = db()
    .prepare("SELECT COUNT(*) AS count FROM pinboard_ideas WHERE x_user_id = ?")
    .get(xUserId) as { count: number };
  const count = submitted.count || 0;
  return {
    submitted: count,
    remaining: isAdmin ? 999 : Math.max(0, MAX_IDEAS_PER_X_ACCOUNT - count),
  };
}

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host") || requestUrl.host;
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const session = getSession(request);
  const offset = parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10) || 0;
  const tab = request.nextUrl.searchParams.get("tab");
  const sort = request.nextUrl.searchParams.get("sort");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10) || 50, 50);

  const userId = session?.id ?? "";
  const voteJoin = `
    LEFT JOIN (SELECT idea_id, COUNT(*) AS votes FROM idea_votes GROUP BY idea_id) v ON p.id = v.idea_id
    LEFT JOIN (SELECT idea_id FROM idea_votes WHERE x_user_id = ?) uv ON p.id = uv.idea_id
  `;
  const selectCols = "p.id, p.username, p.idea, p.status, p.created_at, COALESCE(v.votes,0) AS votes, CASE WHEN uv.idea_id IS NOT NULL THEN 1 ELSE 0 END AS userVoted";
  const order = sort === "top" ? "votes DESC, p.id DESC" : "p.id DESC";

  let ideas: IdeaRow[];
  if (sort === "top") {
    // Leaderboard: top voted approved ideas, no pagination
    ideas = db()
      .prepare(`SELECT ${selectCols} FROM pinboard_ideas p ${voteJoin} WHERE p.status = 'approved' AND COALESCE(v.votes,0) > 0 ORDER BY ${order} LIMIT ?`)
      .all(userId, limit) as IdeaRow[];
  } else if (session?.isAdmin) {
    ideas = db()
      .prepare(`SELECT ${selectCols} FROM pinboard_ideas p ${voteJoin} ORDER BY ${order} LIMIT ${limit} OFFSET ?`)
      .all(userId, offset) as IdeaRow[];
  } else if (tab === "made") {
    ideas = db()
      .prepare(`SELECT ${selectCols} FROM pinboard_ideas p ${voteJoin} WHERE p.status = 'made' ORDER BY ${order} LIMIT ${limit} OFFSET ?`)
      .all(userId, offset) as IdeaRow[];
  } else {
    ideas = db()
      .prepare(`SELECT ${selectCols} FROM pinboard_ideas p ${voteJoin} WHERE p.status = 'approved' ORDER BY ${order} LIMIT ${limit} OFFSET ?`)
      .all(userId, offset) as IdeaRow[];
  }

  const quota = session ? accountStats(session.id, session.isAdmin) : { submitted: 0, remaining: 0 };
  const ideasOut = ideas.map((i) => ({ ...i, userVoted: Boolean(i.userVoted) }));
  return NextResponse.json({
    user: session,
    ideas: ideasOut,
    quota,
    csrfToken: session ? createCsrfToken(session) : null,
    maxIdeasPerAccount: MAX_IDEAS_PER_X_ACCOUNT,
  });
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Sign in with X first" }, { status: 401 });
  if (!session.followsSolWear) {
    return NextResponse.json({ error: "Follow @SolWear_ on X before posting" }, { status: 403 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  if (!verifyCsrfToken(session, request.headers.get("x-csrf-token"))) {
    return NextResponse.json({ error: "Invalid pinboard token" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (!rateLimit(`pinboard:ip:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests from this network" }, { status: 429 });
  }
  if (!rateLimit(`pinboard:account:${session.id}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Slow down before posting another idea" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { idea?: string } | null;
  const idea = cleanIdea(body?.idea);
  if (idea.length < 6) return NextResponse.json({ error: "Idea is too short" }, { status: 400 });

  const status = process.env.PINBOARD_AUTO_APPROVE === "1" ? "approved" : "pending";
  const insertIdea = db().transaction(() => {
    const quota = accountStats(session.id, session.isAdmin);
    if (!session.isAdmin && quota.remaining <= 0) {
      return { inserted: false, quota };
    }

    db().prepare(
      "INSERT INTO pinboard_ideas (x_user_id, username, idea, status, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(session.id, session.username, idea, status, new Date().toISOString());

    return { inserted: true, quota: accountStats(session.id, session.isAdmin) };
  });

  const result = insertIdea();
  if (!result.inserted) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IDEAS_PER_X_ACCOUNT} idea per X account`, quota: result.quota },
      { status: 429 },
    );
  }

  return NextResponse.json({ success: true, status, quota: result.quota });
}
