import { NextRequest, NextResponse } from "next/server";
import { clearOAuthCookie, getOAuthCookie, setSession } from "@/lib/server/session";
import { exchangeCode, introspectToken } from "@/lib/server/x";
import { saveAdminToken } from "@/lib/server/xAdmin";

export const runtime = "nodejs";

function failureReason(error: unknown): string {
  if (!(error instanceof Error)) return "unknown";
  return error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80) || "unknown";
}

function baseUrl(request: NextRequest): string {
  const cb = process.env.X_CALLBACK_URL;
  if (cb) {
    const u = new URL(cb);
    return `${u.protocol}//${u.host}`;
  }
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauth = getOAuthCookie(request);

  const returnTo = oauth?.returnTo ?? "/pinboard/";
  const base = baseUrl(request);

  if (!code || !state || !oauth || oauth.state !== state) {
    return NextResponse.redirect(`${base}${returnTo}?auth=failed&reason=state`);
  }

  try {
    const { accessToken, refreshToken } = await exchangeCode(code, oauth.verifier);
    const me = await introspectToken(accessToken);

    const isAdmin = me.id === process.env.SOLWEAR_X_USER_ID;
    if (isAdmin) {
      saveAdminToken(accessToken, refreshToken);
    }

    const response = NextResponse.redirect(`${base}${returnTo}?auth=ok`);
    setSession(response, {
      id: me.id,
      username: me.username,
      followsSolWear: true,
      isAdmin,
    });
    clearOAuthCookie(response);
    return response;
  } catch (err) {
    console.error("[auth/x/callback] error:", err);
    const response = NextResponse.redirect(
      `${base}${returnTo}?auth=failed&reason=${failureReason(err)}`,
    );
    clearOAuthCookie(response);
    return response;
  }
}
