import { NextRequest, NextResponse } from "next/server";
import { clearOAuthX1Cookie, getOAuthX1Cookie, setSession } from "@/lib/server/session";
import { getAccessToken, getUserProfile } from "@/lib/server/x1";
import { touchCommunityUser } from "@/lib/server/community";

export const runtime = "nodejs";

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

function failureReason(error: unknown): string {
  if (!(error instanceof Error)) return "unknown";
  return error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80) || "unknown";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  const denied = url.searchParams.get("denied");

  const cookie = getOAuthX1Cookie(request);
  const returnTo = cookie?.returnTo ?? "/community/";
  const base = baseUrl(request);

  if (denied || !oauthToken || !oauthVerifier || !cookie) {
    const res = NextResponse.redirect(`${base}${returnTo}?auth=failed&reason=state`);
    if (cookie) clearOAuthX1Cookie(res);
    return res;
  }

  if (oauthToken !== cookie.requestToken) {
    const res = NextResponse.redirect(`${base}${returnTo}?auth=failed&reason=token_mismatch`);
    clearOAuthX1Cookie(res);
    return res;
  }

  try {
    const { accessToken, accessTokenSecret, userId, screenName } = await getAccessToken(
      cookie.requestToken,
      cookie.requestTokenSecret,
      oauthVerifier,
    );

    const isAdmin = userId === process.env.SOLWEAR_X_USER_ID;
    const profile = await getUserProfile(accessToken, accessTokenSecret).catch(() => null);

    // One community record per X account — upserted, never duplicated.
    touchCommunityUser(userId, screenName, isAdmin);

    const response = NextResponse.redirect(`${base}${returnTo}?auth=ok`);
    setSession(response, {
      id: userId,
      username: screenName,
      avatarUrl: profile?.profileImageUrl,
      // OAuth authenticates identity; it does not prove that the account follows SolWear.
      followsSolWear: false,
      isAdmin,
    });
    clearOAuthX1Cookie(response);
    return response;
  } catch (err) {
    console.error("[auth/x1/callback] error:", err);
    const res = NextResponse.redirect(
      `${base}${returnTo}?auth=failed&reason=${failureReason(err)}`,
    );
    clearOAuthX1Cookie(res);
    return res;
  }
}
