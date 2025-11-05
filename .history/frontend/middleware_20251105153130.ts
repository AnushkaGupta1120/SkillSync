import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("accessToken")?.value || req.headers.get("Authorization");

  const path = req.nextUrl.pathname;

  // Public paths
  const publicPaths = ["/auth/login", "/auth/register", "/"];

  if (!token && !publicPaths.includes(path)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Student/:path*",
    "/Dashboard/:path*",
    "/auth/login",
    "/auth/register",
    "/"
  ]
};
