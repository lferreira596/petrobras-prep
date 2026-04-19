import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn   = !!req.auth;
  const isLoginPage  = req.nextUrl.pathname.startsWith("/login");
  const isApiRoute   = req.nextUrl.pathname.startsWith("/api");
  const isAuthRoute  = req.nextUrl.pathname.startsWith("/api/auth");
  const isCronRoute  = req.nextUrl.pathname.startsWith("/api/cron");
  const isPublic     = isLoginPage || isCronRoute || isAuthRoute;

  // NextAuth e cron routes não precisam de sessão
  if (isAuthRoute || isCronRoute) return NextResponse.next();

  // API routes retornam 401, não redirect
  if (isApiRoute && !isLoggedIn)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Redireciona não logados para /login
  if (!isLoggedIn && !isPublic)
    return NextResponse.redirect(new URL("/login", req.url));

  // Redireciona logados que tentam acessar /login
  if (isLoggedIn && isLoginPage)
    return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
