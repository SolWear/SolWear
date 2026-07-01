import { NextResponse } from "next/server";
import { getSiteContent, getSponsorLogos } from "@/lib/server/siteContent";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    content: getSiteContent(),
    sponsors: getSponsorLogos(),
  });
}
