import crypto from "node:crypto";
import { requiredEnv } from "./env";

function sign(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret = "",
): string {
  const sorted = Object.entries(params)
    .map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(v)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  const base = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sorted)].join("&");
  const key = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac("sha1", key).update(base).digest("base64");
}

function authHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  extra: Record<string, string> = {},
  token = "",
  tokenSecret = "",
): string {
  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    ...extra,
  };
  if (token) params.oauth_token = token;

  params.oauth_signature = sign(method, url, params, consumerSecret, tokenSecret);

  const parts = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
  return `OAuth ${parts}`;
}

export async function getRequestToken(callbackUrl: string): Promise<{ token: string; tokenSecret: string }> {
  const consumerKey = requiredEnv("X_API_KEY");
  const consumerSecret = requiredEnv("X_API_SECRET");
  const url = "https://api.twitter.com/oauth/request_token";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader("POST", url, consumerKey, consumerSecret, {
        oauth_callback: callbackUrl,
      }),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[x1/oauth] request_token failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`request_token_${res.status}`);
  }

  const params = new URLSearchParams(await res.text());
  const token = params.get("oauth_token");
  const tokenSecret = params.get("oauth_token_secret");
  if (!token || !tokenSecret || params.get("oauth_callback_confirmed") !== "true") {
    throw new Error("request_token_missing_fields");
  }
  return { token, tokenSecret };
}

export function authorizeUrl(requestToken: string): string {
  return `https://twitter.com/oauth/authorize?oauth_token=${encodeURIComponent(requestToken)}`;
}

// Returns user_id and screen_name directly from the token exchange - no extra API call needed.
export async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  verifier: string,
): Promise<{ accessToken: string; accessTokenSecret: string; userId: string; screenName: string }> {
  const consumerKey = requiredEnv("X_API_KEY");
  const consumerSecret = requiredEnv("X_API_SECRET");
  const url = "https://api.twitter.com/oauth/access_token";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(
        "POST",
        url,
        consumerKey,
        consumerSecret,
        { oauth_verifier: verifier },
        requestToken,
        requestTokenSecret,
      ),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[x1/oauth] access_token failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`access_token_${res.status}`);
  }

  const params = new URLSearchParams(await res.text());
  const accessToken = params.get("oauth_token");
  const accessTokenSecret = params.get("oauth_token_secret");
  const userId = params.get("user_id");
  const screenName = params.get("screen_name");

  if (!accessToken || !accessTokenSecret || !userId || !screenName) {
    throw new Error("access_token_missing_fields");
  }
  return { accessToken, accessTokenSecret, userId, screenName };
}

/** Best-effort profile enrichment; login still works when the app tier cannot access this endpoint. */
export async function getUserProfile(
  accessToken: string,
  accessTokenSecret: string,
): Promise<{ profileImageUrl?: string } | null> {
  const consumerKey = requiredEnv("X_API_KEY");
  const consumerSecret = requiredEnv("X_API_SECRET");
  const url = "https://api.twitter.com/1.1/account/verify_credentials.json";
  const res = await fetch(url, {
    headers: { Authorization: authHeader("GET", url, consumerKey, consumerSecret, {}, accessToken, accessTokenSecret) },
  });
  if (!res.ok) {
    console.warn("[x1/oauth] profile lookup unavailable", { status: res.status });
    return null;
  }
  const data = (await res.json()) as { profile_image_url_https?: string };
  const profileImageUrl = data.profile_image_url_https;
  return profileImageUrl?.startsWith("https://") ? { profileImageUrl } : {};
}
