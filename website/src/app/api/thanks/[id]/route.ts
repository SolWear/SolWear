import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const session = getSession(request);
  if (!session?.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const allowed = ["display_name", "twitter_username", "avatar_url", "description", "stage"] as const;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const key of allowed) {
    if (key in body) {
      sets.push(`${key} = ?`);
      values.push(body[key] ?? null);
    }
  }
  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  values.push(numId);
  db().prepare(`UPDATE thanks_entries SET ${sets.join(", ")} WHERE id = ?`).run(...values);

  const updated = db()
    .prepare("SELECT id, display_name, twitter_username, avatar_url, description, stage, created_at FROM thanks_entries WHERE id = ?")
    .get(numId);

  return NextResponse.json({ entry: updated });
}

export async function DELETE(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const session = getSession(request);
  if (!session?.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const result = db().prepare("DELETE FROM thanks_entries WHERE id = ?").run(numId);
  if (result.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
