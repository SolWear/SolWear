import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public runtime configuration.
 *
 * The Turnstile SITE key is public by definition — it is rendered into the
 * widget markup. Serving it at runtime instead of relying on the build-time
 * NEXT_PUBLIC_ inline removes a whole class of failure: a build that did not
 * receive the value would otherwise ship a form that silently fails every
 * submission. The SECRET key is never exposed — only whether one is set.
 */
export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const required = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());

  return NextResponse.json(
    { turnstileSiteKey: siteKey, turnstileRequired: required },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
