// Configuration settings for the application

interface DatabaseConfig {
  url: string
  name: string
}

interface UploadConfig {
  maxFileSize: number // in bytes
  allowedMimeTypes: string[]
  tempDir: string
}

interface JwtConfig {
  secret: string
  expiresIn: string
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface CacheConfig {
  ttl: number // in seconds
}

interface OcrConfig {
  apiEndpoint: string
  n8nWebhookUrl: string
}

interface AppConfig {
  database: DatabaseConfig
  upload: UploadConfig
  jwt: JwtConfig
  rateLimit: RateLimitConfig
  cache: CacheConfig
  ocr: OcrConfig
  environment: string
}

// Default configuration values
export const config: AppConfig = {
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/accounting",
    name: "accounting",
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
    tempDir: "./tmp/uploads",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: "1d",
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  cache: {
    ttl: 3600, // 1 hour
  },
  ocr: {
    apiEndpoint: "/api/ocr/process",
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "https://ocr-sys-u41198.vm.elestio.app/webhook/upload",
  },
  environment: process.env.NODE_ENV || "development",
}

// Validate configuration
export function validateConfig(): string[] {
  const errors: string[] = []

  // Check for required values in production
  if (config.environment === "production") {
    if (config.jwt.secret === "your-secret-key-change-in-production") {
      errors.push("JWT_SECRET must be changed in production")
    }

    if (!process.env.DATABASE_URL) {
      errors.push("DATABASE_URL must be provided in production")
    }
  }

  return errors
}
