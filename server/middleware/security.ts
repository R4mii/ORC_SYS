import express, { type Express } from "express"
import cors from "cors"
import helmet from "helmet"
import { CONFIG } from "../config/config"
import { AppError } from "../config/types"
import logger from "../config/logger"
import path from "path"

/**
 * Apply security middleware to Express app
 */
export function applySecurity(app: Express): void {
  // Enable helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: CONFIG.isProd ? undefined : false, // Disable CSP in dev
    }),
  )

  // Configure CORS based on environment
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) {
        return callback(null, true)
      }

      // In development, allow any origin
      if (CONFIG.isDev) {
        return callback(null, true)
      }

      // In production, only allow specified origins
      const allowedOrigins = [CONFIG.cors.origin]
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`)
        callback(new AppError("Not allowed by CORS", 403))
      }
    },
    methods: CONFIG.cors.methods,
    allowedHeaders: CONFIG.cors.allowedHeaders,
    credentials: CONFIG.cors.credentials,
    maxAge: 86400, // 24 hours
  }

  app.use(cors(corsOptions))

  // Add security for static file serving to prevent path traversal
  app.use("/uploads", (req, res, next) => {
    // Sanitize the file path to prevent path traversal attacks
    const requestedPath = req.path
    const sanitizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "")

    if (requestedPath !== sanitizedPath) {
      logger.warn(`Attempted path traversal: ${req.ip} - ${requestedPath}`)
      return next(new AppError("Invalid file path", 400))
    }

    // Continue to the next middleware
    next()
  })

  // JSON body parsing with size limit
  app.use(express.json({ limit: "1mb" }))

  // URL-encoded body parsing with size limit
  app.use(express.urlencoded({ extended: true, limit: "1mb" }))
}
