import { NextRequest, NextResponse } from "next/server";
import { setOAuthCookie } from "@/lib/server/session";
import { randomToken, xAuthorizeUrl } from "@/lib/server/x";

export const runtime = "nodejs";

const ALLOWED_RETURN_PATHS = ["/thanks/", "/pinboard/", "/admin/"];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawReturnTo = url.searchParams.get("returnTo") ?? "";
    const returnTo = ALLOWED_RETURN_PATHS.includes(rawReturnTo) ? rawReturnTo : "/pinboard/";

    const state = randomToken();
    const verifier = randomToken();
    const response = NextResponse.redirect(xAuthorizeUrl(state, verifier));
    setOAuthCookie(response, { state, verifier, createdAt: Date.now(), returnTo });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "X auth is not configured";
    const base = new URL(request.url);
    return NextResponse.redirect(
      new URL(`/auth-error?reason=${encodeURIComponent(message)}`, base),
    );
  }
}
