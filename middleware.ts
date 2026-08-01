import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidToken } from "@/lib/authToken";

// httpOnly session cookies, set by the API on a shared parent domain.
// Middleware runs server-side, so httpOnly does not prevent reading them.
// Each surface has its own name so a delegate login cannot displace a parent
// session in the same browser.
const PARENT_COOKIE = "sp_access";
const DELEGATE_COOKIE = "sp_dlg_access";
const SECONDARY_COOKIE = "safepick_secondary_token";

const PARENT_PUBLIC_PATHS = ["/login", "/signup", "/verify"];
const DELEGATE_PUBLIC_PATHS = ["/delegate/login", "/delegate/verify"];
const SECONDARY_PUBLIC_PATHS = ["/secondary/login", "/secondary/verify", "/secondary/join"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Public Paths (No Auth Needed)
  if (pathname === "/") return NextResponse.next();
  if (pathname === "/respond" || pathname.startsWith("/respond/")) return NextResponse.next();
  if (pathname.startsWith("/secondary/join/")) return NextResponse.next();

  // 1. Parent Auth
  const parentToken = await isValidToken(
    req.cookies.get(PARENT_COOKIE)?.value,
    "parent",
  );
  const isParentPath = pathname.startsWith("/dashboard");
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
  const isDelegatePublicPath = DELEGATE_PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/delegate/kyc") || pathname === "/delegate/join" || pathname.startsWith("/delegate/join/");
  const delegateToken = await isValidToken(
    req.cookies.get(DELEGATE_COOKIE)?.value,
    "delegate",
  );
  const isDelegatePath = pathname.startsWith("/delegate") && !isDelegatePublicPath;

  if (isDelegatePath && !delegateToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/delegate/login";
    return NextResponse.redirect(url);
  }
  if (isDelegatePublicPath && delegateToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/delegate/dashboard";
    return NextResponse.redirect(url);
  }

  // 3. Secondary Guardian Auth (Role: SECONDARY_GUARDIAN)
  // Secondary guardian still uses its original cookie: that surface has no
  // backend yet (it is served by mocks), so there is no server to issue an
  // httpOnly session for it. Migrates when its API lands.
  const secondaryToken = await isValidToken(
    req.cookies.get(SECONDARY_COOKIE)?.value,
    "secondary",
  );
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
