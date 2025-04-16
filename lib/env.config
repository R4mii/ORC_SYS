/**
 * Environment variables configuration
 *
 * This file centralizes all environment variables used in the application
 * and provides type safety and validation.
 */

export const env = {
  // Database configuration (Neon)
  database: {
    url: process.env.DATABASE_URL || "",
    postgresUrl: process.env.POSTGRES_URL || "",
    postgresUser: process.env.POSTGRES_USER || "",
    postgresPassword: process.env.POSTGRES_PASSWORD || "",
    postgresDatabase: process.env.POSTGRES_DATABASE || "",
  },

  // OCR service configuration
  ocr: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || "https://ocr-sys-u41198.vm.elestio.app/webhook/upload",
    apiKey: process.env.OCR_API_KEY || "",
    timeout: 60000, // 60 seconds
  },

  // File upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
  },

  // Authentication (for future use)
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    jwtExpiresIn: "1d",
  },

  // API rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },

  // Server configuration
  server: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  },
}

/**
 * Validates that all required environment variables are present
 * @returns Array of missing environment variables
 */
export function validateEnv(): string[] {
  const requiredVars = ["DATABASE_URL"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (process.env.NODE_ENV === "production") {
    // Additional requirements for production
    if (!process.env.N8N_WEBHOOK_URL) {
      missingVars.push("N8N_WEBHOOK_URL")
    }
  }

  return missingVars
}
