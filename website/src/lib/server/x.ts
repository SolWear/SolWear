import crypto from "node:crypto";
import { requiredEnv } from "./env";

export function randomToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function codeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function xAuthorizeUrl(state: string, verifier: string): string {
  const callback = requiredEnv("X_CALLBACK_URL");
  if (!/^https:\/\/.+\/api\/auth\/x\/callback\/?$/.test(callback)) {
    throw new Error("X_CALLBACK_URL must be the public HTTPS /api/auth/x/callback/ URL");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: requiredEnv("X_CLIENT_ID"),
    redirect_uri: callback,
    scope: "tweet.read users.read",
    state,
    code_challenge: codeChallenge(verifier),
    code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  verifier: string,
): Promise<{ accessToken: string; refreshToken?: string }> {
  const clientId = requiredEnv("X_CLIENT_ID");
  const clientSecret = requiredEnv("X_CLIENT_SECRET");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: requiredEnv("X_CALLBACK_URL"),
    code_verifier: verifier,
    client_id: clientId,
  });

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[x/oauth] token exchange failed", { status: res.status, body: text.slice(0, 500) });
    throw new Error(`token_exchange_${res.status}`);
  }
  const data = (await res.json()) as { access_token?: string; refresh_token?: string };
  if (!data.access_token) throw new Error("token_exchange_no_access_token");
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

// Uses app credentials to inspect the user's token - returns username + ID without
// hitting /2/users/me (which is blocked on X Free tier).
export async function introspectToken(accessToken: string): Promise<{ id: string; username: string }> {
  const clientId = requiredEnv("X_CLIENT_ID");
  const clientSecret = requiredEnv("X_CLIENT_SECRET");

  const res = await fetch("https://api.x.com/2/oauth2/introspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ token: accessToken }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[x/oauth] introspect failed", { status: res.status, body: text.slice(0, 500) });
    throw new Error(`introspect_${res.status}`);
  }
  const data = (await res.json()) as {
    active?: boolean;
    sub?: string;
    username?: string;
  };
  if (!data.active) throw new Error("introspect_inactive_token");
  if (!data.sub || !data.username) throw new Error("introspect_missing_fields");
  return { id: data.sub, username: data.username };
}

// Legacy fallback - kept for reference, not called in normal flow
export async function getMe(accessToken: string): Promise<{ id: string; username: string }> {
  const res = await fetch("https://api.x.com/2/users/me?user.fields=username", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`user_lookup_${res.status}`);
  const data = (await res.json()) as { data?: { id: string; username: string } };
  if (!data.data?.id || !data.data.username) throw new Error("X user lookup returned no user");
  return data.data;
}
