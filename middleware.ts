import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/verify", "/delegate"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname === "/";

  if (isPublic) {
    const jwt = req.cookies.get("accessToken")?.value;
    if (jwt && (pathname === "/login" || pathname === "/signup" || pathname === "/verify")) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect parent routes (grouped conceptually as (parent))
  const isParentRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/children") ||
    pathname.startsWith("/delegates") ||
    pathname.startsWith("/authorizations") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/pickup") ||
    pathname.startsWith("/emergency") ||
    pathname.startsWith("/audit");

  if (!isParentRoute) {
    return NextResponse.next();
  }

  const jwt = req.cookies.get("accessToken")?.value;
  if (!jwt) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"]
};
