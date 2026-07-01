import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
import { fetchUserByHandle } from "@/lib/server/xAdmin";

export const runtime = "nodejs";

type ThanksRow = {
  id: number;
  display_name: string;
  twitter_username: string | null;
  avatar_url: string | null;
  description: string | null;
  stage: number;
  created_at: string;
};

export async function GET() {
  const all = db()
    .prepare(
      "SELECT id, display_name, twitter_username, avatar_url, description, stage, created_at FROM thanks_entries ORDER BY id ASC",
    )
    .all() as ThanksRow[];

  return NextResponse.json({
    stage1: all.filter((r) => r.stage === 1),
    stage2: all.filter((r) => r.stage === 2),
  });
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    display_name?: string;
    twitter_username?: string;
    avatar_url?: string;
    description?: string;
    stage?: number;
  } | null;

  const displayName = (body?.display_name ?? "").trim().slice(0, 100);
  if (!displayName) {
    return NextResponse.json({ error: "display_name is required" }, { status: 400 });
  }

  const rawHandle = (body?.twitter_username ?? "").trim().replace(/^@/, "").slice(0, 50);
  const stage = body?.stage === 2 ? 2 : 1;
  const description = (body?.description ?? "").trim().slice(0, 500) || null;

  // Use explicitly provided avatar_url if given, otherwise try Twitter fetch
  let avatarUrl: string | null = body?.avatar_url?.trim() || null;
  if (!avatarUrl && rawHandle) {
    const xUser = await fetchUserByHandle(rawHandle);
    if (xUser?.profile_image_url) {
      avatarUrl = xUser.profile_image_url.replace("_normal", "_400x400");
    }
  }

  const result = db()
    .prepare(
      "INSERT INTO thanks_entries (display_name, twitter_username, avatar_url, description, stage, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(displayName, rawHandle || null, avatarUrl, description, stage, new Date().toISOString());

  const entry = db()
    .prepare("SELECT id, display_name, twitter_username, avatar_url, description, stage, created_at FROM thanks_entries WHERE id = ?")
    .get(result.lastInsertRowid) as ThanksRow;

  return NextResponse.json({ entry }, { status: 201 });
}
