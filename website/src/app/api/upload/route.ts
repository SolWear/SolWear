import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { dataDir } from "@/lib/server/env";

export const runtime = "nodejs";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getSession(request);
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const mime = file.type;
  const ext = ALLOWED_MIME[mime];
  if (!ext) {
    return NextResponse.json({ error: "Only images are allowed (jpeg, png, webp, gif, svg)" }, { status: 415 });
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadsDir = path.join(dataDir(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/api/files/${filename}` });
}
