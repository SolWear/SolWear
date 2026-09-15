import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminMutation } from "@/lib/server/admin";
import { getSiteContent, resetSiteContent, saveSiteContent } from "@/lib/server/siteContent";
import { defaultSiteContent, type SiteContent } from "@/lib/siteContent";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;
  return NextResponse.json({ content: getSiteContent(), defaults: defaultSiteContent });
}

export async function POST(request: NextRequest) {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as { content?: SiteContent; reset?: boolean } | null;
  if (body?.reset) return NextResponse.json({ content: resetSiteContent() });
  if (!body?.content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  try {
    return NextResponse.json({ content: saveSiteContent(body.content) });
  } catch (error) {
    console.error("[admin/content] save failed:", error);
    return NextResponse.json({ error: "Could not save content" }, { status: 500 });
  }
}
