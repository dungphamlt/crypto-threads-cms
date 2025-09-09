import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/(auth)/login") ||
    pathname.startsWith("/(auth)/register") ||
    pathname.startsWith("/(auth)/verify-email");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico");

  // Cho phép truy cập các route public và auth
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Chưa có token: redirect về /login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    console.log("No token found, redirecting to login:", url.toString());
    return NextResponse.redirect(url);
  }

  // Đã có token: cho phép truy cập
  return NextResponse.next();
}

// Loại trừ static/_next và API auth nếu cần
export const config = {
  matcher: ["/((?!_next|images|favicon.ico|api/auth).*)"],
};
