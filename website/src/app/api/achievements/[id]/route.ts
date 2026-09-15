import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminMutation } from "@/lib/server/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const allowed = ["title", "event_name", "description", "date", "place", "image_url"] as const;
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const key of allowed) {
    if (key in body) {
      sets.push(`${key} = ?`);
      values.push(body[key] ?? null);
    }
  }
  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  values.push(id);
  db().prepare(`UPDATE achievements SET ${sets.join(", ")} WHERE id = ?`).run(...values);

  const updated = db().prepare("SELECT * FROM achievements WHERE id = ?").get(id);
  return NextResponse.json({ achievement: updated });
}

export async function DELETE(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const { id } = await params;
  db().prepare("DELETE FROM achievements WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
