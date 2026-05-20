import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/server/db";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; turnstile?: string };
    const { email, turnstile } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const captchaOk = await verifyTurnstile(turnstile ?? "", ip);
    if (!captchaOk) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    // Save to SQLite
    try {
      db().prepare("INSERT INTO notify_emails (email, created_at) VALUES (?, ?)").run(email.trim().toLowerCase(), new Date().toISOString());
    } catch {
      // duplicate email — silently succeed
    }

    // Also append to flat file as backup
    try {
      const dbDir = path.join(process.cwd(), "db");
      await fs.mkdir(dbDir, { recursive: true });
      await fs.appendFile(path.join(dbDir, "emails.txt"), `${new Date().toISOString()} - ${email}\n`);
    } catch { /* non-fatal */ }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
