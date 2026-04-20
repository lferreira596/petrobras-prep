import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage  = pathname.startsWith("/login");
  const isApiRoute   = pathname.startsWith("/api");
  const isAuthRoute  = pathname.startsWith("/api/auth");
  const isCronRoute  = pathname.startsWith("/api/cron");

  if (isAuthRoute || isCronRoute) return NextResponse.next();

  // next-auth v5 usa __Secure- em HTTPS (prod) e sem prefixo em HTTP (dev)
  const sessionToken =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");
  const isLoggedIn = !!sessionToken;

  if (isApiRoute && !isLoggedIn)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isLoggedIn && !isLoginPage)
    return NextResponse.redirect(new URL("/login", req.url));

  if (isLoggedIn && isLoginPage)
    return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
