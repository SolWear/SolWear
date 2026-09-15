import { NextRequest, NextResponse } from "next/server";
import { pageSlugs } from "@/lib/docs";

/**
 * Edge middleware handles only redirects — no database access. Coming-soon mode
 * is enforced in the page layer, where SQLite is available.
 */
const REDIRECTS: Record<string, string> = {
  "/pitch": "/",
  "/pinboard": "/community/",
  "/thanks": "/",
  "/achievements": "/",
  "/cheremsha": "/",
  "/preview": "/",
  "/auth-error": "/community/",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();

  if (host === "docs.solwear.tech") {
    // Framework endpoints and public files must remain addressable at their
    // real path; everything else on this host is either a clean docs slug or
    // belongs back on the primary site.
    const isAsset = /\.[a-z0-9]+$/i.test(pathname);
    if (pathname.startsWith("/_next/") || pathname.startsWith("/api/") || isAsset) {
      return NextResponse.next();
    }

    const slug = normalized.slice(1);
    if (normalized === "/" || pageSlugs().includes(slug)) {
      const rewrite = request.nextUrl.clone();
      rewrite.pathname = normalized === "/" ? "/docs/" : `/docs/${slug}/`;
      return NextResponse.rewrite(rewrite);
    }

    const primary = new URL(`${pathname}${request.nextUrl.search}`, "https://solwear.tech");
    return NextResponse.redirect(primary, 308);
  }

  if ((host === "solwear.tech" || host === "www.solwear.tech") && (normalized === "/docs" || normalized.startsWith("/docs/"))) {
    const cleanPath = normalized === "/docs" ? "/" : `${normalized.slice(5)}/`;
    const docsUrl = new URL(`${cleanPath}${request.nextUrl.search}`, "https://docs.solwear.tech");
    return NextResponse.redirect(docsUrl, 301);
  }

  // The pitch subdomain outlived the pitch page; send it to the site root.
  if (host === "pitch.solwear.tech") {
    return NextResponse.redirect(new URL("/", `https://solwear.tech`), 308);
  }

  for (const [from, to] of Object.entries(REDIRECTS)) {
    if (normalized === from || normalized.startsWith(`${from}/`)) {
      return NextResponse.redirect(new URL(to, request.url), 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
