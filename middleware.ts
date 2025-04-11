import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth/login" || path === "/auth/register" || path === "/auth/forgot-password"

  // Get the token from localStorage (client-side only)
  // For server-side middleware, we need to use cookies instead
  const token = request.cookies.get("token")?.value || ""

  // For this demo, we'll simplify the middleware to allow access to dashboard routes
  // In a real app, you would verify the token properly

  // If the path is public and there's a token, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/auth/:path*"],
}
