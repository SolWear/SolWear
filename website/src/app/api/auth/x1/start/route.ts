import { NextRequest, NextResponse } from "next/server";
import { hasGatePass, setOAuthX1Cookie } from "@/lib/server/session";
import { authorizeUrl, getRequestToken } from "@/lib/server/x1";

export const runtime = "nodejs";

const ALLOWED_RETURN_TO = ["/community/", "/admin/"];

function x1CallbackUrl(request: NextRequest): string {
  const configured = process.env.X_CALLBACK_URL?.trim();
  if (configured) {
    const callback = new URL(configured);
    if (callback.pathname !== "/api/auth/x1/callback/") throw new Error("invalid_X_CALLBACK_URL_path");
    return callback.href;
  }
  if (process.env.NODE_ENV === "production") throw new Error("missing_X_CALLBACK_URL");
  return new URL("/api/auth/x1/callback/", request.url).href;
}

export async function GET(request: NextRequest) {
  try {
    const returnToParam = new URL(request.url).searchParams.get("returnTo") ?? "";
    const returnTo = ALLOWED_RETURN_TO.includes(returnToParam) ? returnToParam : "/community/";

    // Step 2 of the gate is unreachable without having cleared Turnstile first.
    // Admins sign in through the same door, so /admin/ is gated too.
    if (!hasGatePass(request)) {
      const base = process.env.X_CALLBACK_URL ? new URL(process.env.X_CALLBACK_URL).origin : request.nextUrl.origin;
      return NextResponse.redirect(`${base}/community/?auth=failed&reason=verify_first`);
    }

    const { token, tokenSecret } = await getRequestToken(x1CallbackUrl(request));

    const response = NextResponse.redirect(authorizeUrl(token));
    setOAuthX1Cookie(response, {
      requestToken: token,
      requestTokenSecret: tokenSecret,
      createdAt: Date.now(),
      returnTo,
    });
    return response;
  } catch (err) {
    console.error("[auth/x1/start] error:", err);
    const reason =
      err instanceof Error ? err.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80) : "unknown";
    const base = process.env.X_CALLBACK_URL ? new URL(process.env.X_CALLBACK_URL).origin : request.nextUrl.origin;
    return NextResponse.redirect(`${base}/community/?auth=failed&reason=${reason}`);
  }
}
