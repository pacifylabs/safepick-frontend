import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PARENT_PUBLIC_PATHS = ["/login", "/signup", "/verify"];
const DELEGATE_PUBLIC_PATHS = ["/delegate/login", "/delegate/verify"];
const SECONDARY_PUBLIC_PATHS = ["/secondary/login", "/secondary/verify", "/secondary/join"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Public Paths (No Auth Needed)
  if (pathname === "/respond" || pathname.startsWith("/respond/")) return NextResponse.next();
  if (pathname.startsWith("/secondary/join/")) return NextResponse.next();

  // 1. Parent Auth
  const parentToken = req.cookies.get("accessToken")?.value;
  const isParentPath = pathname.startsWith("/dashboard") || pathname === "/";
  const isParentPublic = PARENT_PUBLIC_PATHS.includes(pathname);

  if (isParentPath && !parentToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (isParentPublic && parentToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 2. Delegate Auth
  const delegateToken = req.cookies.get("delegate-access-token")?.value;
  const isDelegatePath = pathname.startsWith("/delegate") && !DELEGATE_PUBLIC_PATHS.includes(pathname);
  const isDelegatePublic = DELEGATE_PUBLIC_PATHS.includes(pathname);

  if (isDelegatePath && !delegateToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/delegate/login";
    return NextResponse.redirect(url);
  }
  if (isDelegatePublic && delegateToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/delegate/dashboard"; // Assuming this is the delegate home
    return NextResponse.redirect(url);
  }

  // 3. Secondary Guardian Auth (Role: SECONDARY_GUARDIAN)
  const secondaryToken = req.cookies.get("safepick_secondary_token")?.value;
  const isSecondaryPath = pathname.startsWith("/secondary") && !SECONDARY_PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isSecondaryPublic = SECONDARY_PUBLIC_PATHS.some(p => pathname.startsWith(p));

  if (isSecondaryPath && !secondaryToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/secondary/login";
    return NextResponse.redirect(url);
  }
  if (isSecondaryPublic && secondaryToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/secondary/history";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"]
};
