export type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: "missing_secret" | "missing_token" | "rejected" | "upstream_error"; errorCodes?: string[] };

export async function verifyTurnstileDetailed(token: string, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "production"
      ? { ok: false, reason: "missing_secret" }
      : { ok: true, skipped: true };
  }
  if (!token) return { ok: false, reason: "missing_token" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!res.ok) return { ok: false, reason: "upstream_error" };
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return data.success === true
      ? { ok: true }
      : { ok: false, reason: "rejected", errorCodes: data["error-codes"] };
  } catch (error) {
    console.error("[turnstile] verification request failed:", error);
    return { ok: false, reason: "upstream_error" };
  }
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  return (await verifyTurnstileDetailed(token, ip)).ok;
}
