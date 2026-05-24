import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("admin-token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // If no token and not on login page → redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists and on login page → redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all routes except static files and api routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};