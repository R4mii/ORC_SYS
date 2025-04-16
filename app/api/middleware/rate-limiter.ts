/**
 * Rate limiting middleware for API routes
 * Helps protect against abuse and DoS attacks
 */

import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env.config"
import { logger } from "@/lib/services/logger"

// Simple in-memory store for rate limiting
// For production, you would use Redis or another distributed cache
interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Cleans up expired entries from the rate limit store
 */
function cleanupStore() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime <= now) {
      delete store[key]
    }
  })
}

// Run cleanup every minute
setInterval(cleanupStore, 60000)

/**
 * Rate limiter middleware function
 * @param req Next.js request object
 * @param options Custom options for rate limiting
 * @returns NextResponse with rate limit headers or null to continue
 */
export function rateLimiter(
  req: NextRequest,
  options: {
    windowMs?: number
    maxRequests?: number
    identifierFn?: (req: NextRequest) => string
  } = {},
) {
  const {
    windowMs = env.rateLimit.windowMs,
    maxRequests = env.rateLimit.maxRequests,
    identifierFn = getIdentifier,
  } = options

  // Get a unique identifier for the requester (IP address by default)
  const identifier = identifierFn(req)
  const now = Date.now()

  // Initialize or retrieve rate limit entry
  if (!store[identifier] || store[identifier].resetTime <= now) {
    store[identifier] = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  // Increment request count
  store[identifier].count++

  // Calculate remaining requests and time to reset
  const remaining = Math.max(0, maxRequests - store[identifier].count)
  const reset = Math.ceil((store[identifier].resetTime - now) / 1000)

  // Set rate limit headers
  const headers = new Headers({
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  })

  // Check if rate limit is exceeded
  if (store[identifier].count > maxRequests) {
    logger.warn(`Rate limit exceeded for ${identifier}`, "RateLimiter", {
      count: store[identifier].count,
      limit: maxRequests,
    })

    // Add retry-after header
    headers.append("Retry-After", String(reset))

    return NextResponse.json(
      {
        error: "Too many requests, please try again later",
        retryAfter: reset,
      },
      {
        status: 429,
        headers,
      },
    )
  }

  // Continue with the request but add rate limit headers
  return null
}

/**
 * Gets a unique identifier for the requester
 * @param req Next.js request object
 * @returns Unique identifier string (IP address by default)
 */
function getIdentifier(req: NextRequest): string {
  // Use X-Forwarded-For header if available (common with proxies)
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Get the first IP in the list, which is the client's original IP
    return forwardedFor.split(",")[0].trim()
  }

  // Fallback to using the connecting IP
  return req.ip || "127.0.0.1"
}

/**
 * Example usage in an API route:
 *
 * export async function POST(req: NextRequest) {
 *   // Apply rate limiting
 *   const rateLimit = rateLimiter(req, {
 *     maxRequests: 5, // Allow only 5 requests per window
 *     windowMs: 60 * 1000 // 1 minute window
 *   });
 *
 *   // Return early if rate limit is exceeded
 *   if (rateLimit) return rateLimit;
 *
 *   // Continue with the normal request handling
 *   // ...
 * }
 */
