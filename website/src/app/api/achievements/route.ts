import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdminMutation } from "@/lib/server/admin";

export const runtime = "nodejs";

type AchievementRow = {
  id: number;
  title: string;
  event_name: string;
  description: string;
  date: string;
  place: string;
  image_url: string | null;
  created_at: string;
};

export async function GET() {
  const achievements = db()
    .prepare("SELECT * FROM achievements ORDER BY date DESC")
    .all() as AchievementRow[];
  return NextResponse.json({ achievements });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    event_name?: string;
    description?: string;
    date?: string;
    place?: string;
    image_url?: string;
  } | null;

  if (!body?.title || !body.event_name || !body.description || !body.date || !body.place) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = db()
    .prepare(
      "INSERT INTO achievements (title, event_name, description, date, place, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(body.title.trim(), body.event_name.trim(), body.description.trim(), body.date, body.place.trim(), body.image_url ?? null, now);

  const achievement = db()
    .prepare("SELECT * FROM achievements WHERE id = ?")
    .get(result.lastInsertRowid) as AchievementRow;

  return NextResponse.json({ achievement }, { status: 201 });
}
