import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  if (host === "pitch.solwear.tech") {
    // Rewrite every path on the pitch subdomain to /pitch so the pitch page renders
    if (!pathname.startsWith("/pitch")) {
      const url = request.nextUrl.clone();
      url.pathname = "/pitch";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
