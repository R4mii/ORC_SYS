import rateLimit from "express-rate-limit"
import { CONFIG } from "../config/config"
import logger from "../config/logger"

/**
 * Create a general rate limiter for all API routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: "Too many requests, please try again later.",
    timestamp: Date.now(),
  },
  // Add logging for rate limited requests
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`)
    res.status(429).json(options.message)
  },
})

/**
 * Create a more strict rate limiter for OCR requests which are resource intensive
 */
export const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: CONFIG.isProd ? 20 : 50, // stricter limit in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many OCR requests, please try again later.",
    timestamp: Date.now(),
  },
  handler: (req, res, next, options) => {
    logger.warn(`OCR rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`)
    res.status(429).json(options.message)
  },
  // Skip rate limiting in test environment
  skip: () => CONFIG.isTest,
})
