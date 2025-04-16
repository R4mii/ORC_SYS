/**
 * Unit tests for the rate limiter middleware
 */

import type { NextRequest } from "next/server"
import { rateLimiter } from "@/app/api/middleware/rate-limiter"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock NextRequest
function createMockRequest(ip = "127.0.0.1", headers: Record<string, string> = {}): NextRequest {
  const mockHeaders = new Headers()
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.append(key, value)
  })

  return {
    ip,
    headers: mockHeaders,
  } as unknown as NextRequest
}

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Reset the store between tests by using a small timeout
    jest.advanceTimersByTime(60 * 1000)
  })

  it("should allow requests under the limit", () => {
    const req = createMockRequest()
    const options = { maxRequests: 3, windowMs: 60 * 1000 }

    // First request should be allowed
    const response1 = rateLimiter(req, options)
    expect(response1).toBeNull()

    // Second request should be allowed
    const response2 = rateLimiter(req, options)
    expect(response2).toBeNull()

    // Third request should be allowed
    const response3 = rateLimiter(req, options)
    expect(response3).toBeNull()
  })

  it("should block requests over the limit", () => {
    const req = createMockRequest()
    const options = { maxRequests: 2, windowMs: 60 * 1000 }

    // First two requests should be allowed
    expect(rateLimiter(req, options)).toBeNull()
    expect(rateLimiter(req, options)).toBeNull()

    // Third request should be blocked
    const response = rateLimiter(req, options)
    expect(response).not.toBeNull()
    expect(response?.status).toBe(429)
  })

  it("should use X-Forwarded-For header when available", () => {
    const req1 = createMockRequest("127.0.0.1", { "x-forwarded-for": "192.168.1.1" })
    const req2 = createMockRequest("127.0.0.1", { "x-forwarded-for": "192.168.1.2" })
    const options = { maxRequests: 1, windowMs: 60 * 1000 }

    // Request from first IP should be allowed
    expect(rateLimiter(req1, options)).toBeNull()

    // Request from second IP should also be allowed (different identifier)
    expect(rateLimiter(req2, options)).toBeNull()

    // Second request from first IP should be blocked
    const response = rateLimiter(req1, options)
    expect(response).not.toBeNull()
    expect(response?.status).toBe(429)
  })

  it("should reset the counter after the window expires", () => {
    const req = createMockRequest()
    const options = { maxRequests: 1, windowMs: 5 * 1000 } // 5 second window

    // First request should be allowed
    expect(rateLimiter(req, options)).toBeNull()

    // Second request should be blocked
    expect(rateLimiter(req, options)?.status).toBe(429)

    // Advance time past the window
    jest.advanceTimersByTime(6 * 1000)

    // New request should be allowed after window expires
    expect(rateLimiter(req, options)).toBeNull()
  })

  it("should set appropriate headers", () => {
    const req = createMockRequest()
    const options = { maxRequests: 5, windowMs: 60 * 1000 }

    // Make a request
    rateLimiter(req, options)

    // Make a second request to check headers
    const response = rateLimiter(req, options)
    expect(response).toBeNull() // Still under limit

    // If we make a request that exceeds the limit
    for (let i = 0; i < 4; i++) {
      rateLimiter(req, options)
    }

    const blockedResponse = rateLimiter(req, options)
    expect(blockedResponse).not.toBeNull()
    expect(blockedResponse?.status).toBe(429)
    expect(blockedResponse?.headers.get("X-RateLimit-Limit")).toBe("5")
    expect(blockedResponse?.headers.get("X-RateLimit-Remaining")).toBe("0")
    expect(blockedResponse?.headers.get("X-RateLimit-Reset")).toBeDefined()
    expect(blockedResponse?.headers.get("Retry-After")).toBeDefined()
  })
})
