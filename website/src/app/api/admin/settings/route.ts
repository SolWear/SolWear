import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminMutation } from "@/lib/server/admin";
import { defaultSettings, getSettings, saveSettings, type SiteSettings } from "@/lib/server/settings";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;
  return NextResponse.json({ settings: getSettings(), defaults: defaultSettings });
}

export async function POST(request: NextRequest) {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as { settings?: SiteSettings } | null;
  if (!body?.settings) return NextResponse.json({ error: "settings is required" }, { status: 400 });

  return NextResponse.json({ settings: saveSettings(body.settings) });
}
