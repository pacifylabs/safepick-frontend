import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PARENT_PUBLIC_PATHS = ["/login", "/signup", "/verify"];
const DELEGATE_PUBLIC_PATHS = ["/delegate/login", "/delegate/verify"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Handle Parent Public Paths
  if (PARENT_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const jwt = req.cookies.get("accessToken")?.value;
    if (jwt) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. Handle Delegate Public Paths
  if (DELEGATE_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const jwt = req.cookies.get("delegate-access-token")?.value;
    if (jwt) {
      return NextResponse.redirect(new URL("/delegate/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 3. Protect Parent Routes
  const isParentRoute = 
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/children") ||
    pathname.startsWith("/delegates") ||
    pathname.startsWith("/authorizations") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/pickup") ||
    pathname.startsWith("/emergency") ||
    pathname.startsWith("/audit");

  if (isParentRoute) {
    const jwt = req.cookies.get("accessToken")?.value;
    if (!jwt) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. Protect Delegate Routes
  const isDelegateRoute = pathname.startsWith("/delegate") && !DELEGATE_PUBLIC_PATHS.includes(pathname);
  if (isDelegateRoute) {
    const jwt = req.cookies.get("delegate-access-token")?.value;
    if (!jwt) {
      const url = new URL("/delegate/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"]
};
