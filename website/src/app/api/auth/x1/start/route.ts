import { NextRequest, NextResponse } from "next/server";
import { setOAuthX1Cookie } from "@/lib/server/session";
import { authorizeUrl, getRequestToken } from "@/lib/server/x1";

export const runtime = "nodejs";

const ALLOWED_RETURN_TO = ["/pinboard/", "/cheremsha/", "/thanks/", "/admin/"];

function x1CallbackUrl(): string {
  const cb = process.env.X_CALLBACK_URL;
  if (cb) {
    const u = new URL(cb);
    return `${u.protocol}//${u.host}/api/auth/x1/callback/`;
  }
  return "https://solwear.tech/api/auth/x1/callback/";
}

export async function GET(request: NextRequest) {
  try {
    const returnToParam = new URL(request.url).searchParams.get("returnTo") ?? "";
    const returnTo = ALLOWED_RETURN_TO.includes(returnToParam) ? returnToParam : "/pinboard/";

    const { token, tokenSecret } = await getRequestToken(x1CallbackUrl());

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
    const base = process.env.X_CALLBACK_URL
      ? `${new URL(process.env.X_CALLBACK_URL).protocol}//${new URL(process.env.X_CALLBACK_URL).host}`
      : "";
    return NextResponse.redirect(`${base}/pinboard/?auth=failed&reason=${reason}`);
  }
}
