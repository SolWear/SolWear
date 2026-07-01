import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { unpack, setSession } from "@/lib/server/session";

export const runtime = "nodejs";

const BS58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodeBase58(str: string): Buffer {
  const bytes = [0];
  for (const char of str) {
    const idx = BS58_ALPHABET.indexOf(char);
    if (idx < 0) throw new Error("Invalid base58 char");
    let carry = idx;
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of str) {
    if (char === "1") bytes.push(0);
    else break;
  }
  bytes.reverse();
  return Buffer.from(bytes);
}

function verifyEd25519(publicKeyBytes: Buffer, message: Buffer, signature: Buffer): boolean {
  try {
    const spkiHeader = Buffer.from("302a300506032b6570032100", "hex");
    const pubKeyDer = Buffer.concat([spkiHeader, publicKeyBytes]);
    const pubKey = crypto.createPublicKey({ key: pubKeyDer, format: "der", type: "spki" });
    return crypto.verify(null, message, pubKey, signature);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const challengeCookie = unpack<{ nonce: string; createdAt: number }>(
    request.cookies.get("sw_wallet_challenge")?.value,
  );
  if (!challengeCookie || Date.now() - challengeCookie.createdAt > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as {
    publicKey?: string;
    signature?: number[];
    nonce?: string;
  } | null;

  if (!body?.publicKey || !Array.isArray(body.signature) || !body.nonce) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.nonce !== challengeCookie.nonce) {
    return NextResponse.json({ error: "Nonce mismatch" }, { status: 400 });
  }

  let publicKeyBytes: Buffer;
  try {
    publicKeyBytes = decodeBase58(body.publicKey);
  } catch {
    return NextResponse.json({ error: "Invalid public key" }, { status: 400 });
  }

  if (publicKeyBytes.length !== 32) {
    return NextResponse.json({ error: "Invalid public key length" }, { status: 400 });
  }

  const message = Buffer.from(body.nonce, "utf8");
  const signature = Buffer.from(body.signature);

  if (!verifyEd25519(publicKeyBytes, message, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const shortAddress = `${body.publicKey.slice(0, 4)}...${body.publicKey.slice(-4)}`;
  const res = NextResponse.json({ success: true });

  setSession(res, {
    id: `wallet:${body.publicKey}`,
    username: shortAddress,
    followsSolWear: true,
    isAdmin: false,
    walletAddress: body.publicKey,
  });

  res.cookies.set("sw_wallet_challenge", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
