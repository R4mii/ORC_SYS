import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/forgot-password" ||
    path === "/" ||
    path.startsWith("/about") ||
    path.startsWith("/pricing") ||
    path.startsWith("/services") ||
    path.startsWith("/solutions") ||
    path.startsWith("/contact")

  // For this demo, we'll simplify the middleware
  // Since we're using localStorage for auth in this demo app,
  // we'll just allow access to all routes and handle auth on the client side

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
}
