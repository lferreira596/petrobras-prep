import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREMIUM_ROUTES = ["/simulado"];
const ADMIN_ROUTES   = ["/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthRoute  = pathname.startsWith("/api/auth");
  const isCronRoute  = pathname.startsWith("/api/cron");
  const isWebhook    = pathname.startsWith("/api/webhook");

  if (isAuthRoute || isCronRoute || isWebhook) return NextResponse.next();

  const sessionToken =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token");
  const isLoggedIn = !!sessionToken;

  const isLoginPage = pathname.startsWith("/login");
  const isApiRoute  = pathname.startsWith("/api");

  if (isApiRoute && !isLoggedIn)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isLoggedIn && !isLoginPage)
    return NextResponse.redirect(new URL("/login", req.url));

  if (isLoggedIn && isLoginPage)
    return NextResponse.redirect(new URL("/dashboard", req.url));

  // Rotas premium e admin: verificação feita no servidor dentro da própria page
  // O middleware apenas deixa passar — a page faz redirect se necessário.
  // Isso evita leitura de DB no Edge Runtime.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
