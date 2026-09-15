import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requiredEnv } from "./env";

export type SolWearSession = {
  id: string;
  username: string;
  avatarUrl?: string;
  followsSolWear: boolean;
  isAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
};

const SESSION_COOKIE = "sw_session";
const OAUTH_COOKIE = "sw_x_oauth";
const OAUTH_X1_COOKIE = "sw_x1_oauth";
const MAX_AGE = 60 * 60 * 24 * 14;

function secret(): string {
  const value = requiredEnv("SESSION_SECRET");
  if (value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return value;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function pack(value: unknown): string {
  const payload = b64url(JSON.stringify(value));
  return `${payload}.${sign(payload)}`;
}

export function unpack<T>(packed?: string): T | null {
  if (!packed) return null;
  const [payload, mac] = packed.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function getSession(request: NextRequest): SolWearSession | null {
  return getSessionFromCookie(request.cookies.get(SESSION_COOKIE)?.value);
}

/** Validates both the signature and the server-side expiry in the payload. */
export function getSessionFromCookie(packed?: string): SolWearSession | null {
  const session = unpack<SolWearSession>(packed);
  if (!session?.id || !session.username || !session.expiresAt) return null;
  if (session.expiresAt <= Date.now()) return null;
  return session;
}

export function createCsrfToken(session: SolWearSession): string {
  return sign(`csrf:${session.id}:${session.issuedAt}`);
}

export function verifyCsrfToken(session: SolWearSession, token: string | null): boolean {
  if (!token) return false;
  const expected = createCsrfToken(session);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function setSession(
  response: NextResponse,
  session: Omit<SolWearSession, "issuedAt" | "expiresAt">,
): void {
  const issuedAt = Date.now();
  response.cookies.set(SESSION_COOKIE, pack({ ...session, issuedAt, expiresAt: issuedAt + MAX_AGE * 1000 }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type OAuthCookie = {
  state: string;
  verifier: string;
  createdAt: number;
  returnTo?: string;
};

export function setOAuthCookie(response: NextResponse, value: OAuthCookie): void {
  response.cookies.set(OAUTH_COOKIE, pack(value), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export function getOAuthCookie(request: NextRequest): OAuthCookie | null {
  const value = unpack<OAuthCookie>(request.cookies.get(OAUTH_COOKIE)?.value);
  if (!value) return null;
  if (Date.now() - value.createdAt > 10 * 60 * 1000) return null;
  return value;
}

export function clearOAuthCookie(response: NextResponse): void {
  response.cookies.set(OAUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type OAuthX1Cookie = {
  requestToken: string;
  requestTokenSecret: string;
  createdAt: number;
  returnTo?: string;
};

export function setOAuthX1Cookie(response: NextResponse, value: OAuthX1Cookie): void {
  response.cookies.set(OAUTH_X1_COOKIE, pack(value), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
}

export function getOAuthX1Cookie(request: NextRequest): OAuthX1Cookie | null {
  const value = unpack<OAuthX1Cookie>(request.cookies.get(OAUTH_X1_COOKIE)?.value);
  if (!value) return null;
  if (Date.now() - value.createdAt > 10 * 60 * 1000) return null;
  return value;
}

export function clearOAuthX1Cookie(response: NextResponse): void {
  response.cookies.set(OAUTH_X1_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ── Community gate ──────────────────────────────────────────────────────────
// Proof that the visitor cleared Turnstile, so step 2 (X OAuth) cannot be
// reached by linking straight to the authorize URL.

const GATE_COOKIE = "sw_gate";
const GATE_MAX_AGE = 60 * 30;

export type GateCookie = { passedAt: number };

export function setGateCookie(response: NextResponse): void {
  response.cookies.set(GATE_COOKIE, pack({ passedAt: Date.now() } satisfies GateCookie), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
}

export function hasGatePass(request: NextRequest): boolean {
  const value = unpack<GateCookie>(request.cookies.get(GATE_COOKIE)?.value);
  if (!value) return false;
  return Date.now() - value.passedAt < GATE_MAX_AGE * 1000;
}
