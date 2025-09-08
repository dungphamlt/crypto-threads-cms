import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isAuthRoute =
    pathname === "/login" || pathname.startsWith("/(auth)/login");

  // Chưa có token: chặn các route bảo vệ, nhưng cho phép vào /login
  if (!token && !isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    console.log("Redirecting to login:", url.toString());
    // return NextResponse.redirect(url);
  }

  // Đã có token: tránh vào lại /login
  if (token && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Loại trừ static/_next và API auth nếu cần
export const config = {
  matcher: ["/((?!_next|images|favicon.ico|api/auth).*)"],
};
