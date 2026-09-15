import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession, verifyCsrfToken } from "./session";
import { rateLimit } from "./rateLimit";

export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
    const proto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
    return originUrl.host === host && originUrl.protocol === `${proto}:`;
  } catch {
    return false;
  }
}

export function requireAdmin(request: NextRequest) {
  const session = getSession(request);
  const configuredAdminId = process.env.SOLWEAR_X_USER_ID?.trim();
  if (!session?.isAdmin || !configuredAdminId || session.id !== configuredAdminId) {
    return {
      session,
      response: NextResponse.json({ error: "Admin only" }, { status: 403 }),
    };
  }
  return { session, response: null };
}

export function requireAdminMutation(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response || !auth.session) return auth;
  if (!sameOrigin(request)) {
    return {
      session: auth.session,
      response: NextResponse.json({ error: "Invalid request origin" }, { status: 403 }),
    };
  }
  if (!verifyCsrfToken(auth.session, request.headers.get("x-csrf-token"))) {
    return {
      session: auth.session,
      response: NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 }),
    };
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`admin-mutation:${auth.session.id}:${ip}`, 120, 10 * 60 * 1000)) {
    return {
      session: auth.session,
      response: NextResponse.json({ error: "Too many admin requests" }, { status: 429 }),
    };
  }
  return auth;
}
