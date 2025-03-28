import rateLimit from "express-rate-limit"
import { config } from "../config"

// Create rate limiter middleware
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60), // minutes
  },
  // Store to track request counts (default is memory store)
  // For production, consider using a more robust store like Redis
  // store: new RedisStore({...})
})

// Create a more restrictive rate limiter for OCR processing
export const ocrRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.floor(config.rateLimit.maxRequests / 2), // More restrictive for resource-intensive operations
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many OCR requests, please try again later.",
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60), // minutes
  },
})

