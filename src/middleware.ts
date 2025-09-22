import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Early return for public routes to minimize processing
  if (
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static/")
  ) {
    return NextResponse.next();
  }

  // Early return for auth routes
  if (pathname === "/login" || pathname.startsWith("/(auth)/")) {
    return NextResponse.next();
  }

  // Check token only for protected routes
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Loại trừ static/_next và API auth nếu cần
export const config = {
  matcher: ["/((?!_next|images|favicon.ico|api/auth).*)"],
};
