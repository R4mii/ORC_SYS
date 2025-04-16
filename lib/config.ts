// Configuration management for the application
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Export configuration variables with defaults
export const config = {
  // Google Cloud Vision API
  googleCloudCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,

  // File upload settings
  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || "image/jpeg,image/png,application/pdf").split(","),
    tempDir: process.env.TEMP_UPLOAD_DIR || "./tmp/uploads",
  },

  // API rate limiting
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes default
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX || "100"), // 100 requests per windowMs
  },

  // Cache settings
  cache: {
    ttl: Number.parseInt(process.env.CACHE_TTL || "3600"), // 1 hour default
  },

  // Database connection
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/accounting",
  },

  // JWT for authentication
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  // Server settings
  server: {
    port: Number.parseInt(process.env.PORT || "3000"),
    env: process.env.NODE_ENV || "development",
  },
}
