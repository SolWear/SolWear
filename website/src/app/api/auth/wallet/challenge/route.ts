import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { pack } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  const nonce = crypto.randomBytes(16).toString("hex");
  const message = `Sign in to SolWear: ${nonce}`;
  const cookie = pack({ nonce, createdAt: Date.now() });

  const res = NextResponse.json({ nonce: message });
  res.cookies.set("sw_wallet_challenge", cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
  return res;
}
