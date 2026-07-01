import { NextRequest, NextResponse } from "next/server";
import { defaultSiteContent, type SiteContent } from "@/lib/siteContent";
import { requireAdmin } from "@/lib/server/admin";
import { getSiteContent, saveSiteContent } from "@/lib/server/siteContent";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  return NextResponse.json({
    content: getSiteContent(),
    defaults: defaultSiteContent,
  });
}

export async function POST(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as { content?: SiteContent } | null;
  if (!body?.content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  saveSiteContent(body.content);
  return NextResponse.json({ content: body.content });
}
