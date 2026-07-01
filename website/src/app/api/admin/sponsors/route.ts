import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin";
import { deleteSponsorLogo, getSponsorLogos, upsertSponsorLogo } from "@/lib/server/siteContent";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;
  return NextResponse.json({ sponsors: getSponsorLogos() });
}

export async function POST(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as {
    id?: number;
    name?: string;
    logo_url?: string;
    href?: string | null;
    invert?: boolean;
    brightness?: number;
    sort_order?: number;
    delete?: boolean;
  } | null;

  if (body?.delete) {
    const id = Number(body.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid sponsor id" }, { status: 400 });
    return NextResponse.json({ ok: deleteSponsorLogo(id) });
  }

  try {
    const sponsor = upsertSponsorLogo({
      id: body?.id,
      name: body?.name ?? "",
      logo_url: body?.logo_url ?? "",
      href: body?.href,
      invert: body?.invert,
      brightness: body?.brightness,
      sort_order: body?.sort_order,
    });
    return NextResponse.json({ sponsor });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save sponsor" },
      { status: 400 },
    );
  }
}
