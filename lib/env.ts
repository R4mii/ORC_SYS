// Environment variables configuration with type safety

// Define the shape of our environment variables
interface Env {
  // Google Cloud Vision API
  GOOGLE_APPLICATION_CREDENTIALS: string

  // File upload settings
  MAX_FILE_SIZE: number
  ALLOWED_MIME_TYPES: string[]
  TEMP_UPLOAD_DIR: string

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_MAX: number

  // Cache settings
  CACHE_TTL: number

  // Database connection
  DATABASE_URL: string

  // JWT for authentication
  JWT_SECRET: string
  JWT_EXPIRES_IN: string

  // AWS S3 Storage
  AWS_REGION: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_S3_BUCKET: string

  // Server settings
  PORT: number
  NODE_ENV: "development" | "production" | "test"
}

// Parse environment variables with defaults and type conversion
export const env: Env = {
  // Google Cloud Vision API
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",

  // File upload settings
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE || 10485760), // 10MB default
  ALLOWED_MIME_TYPES: (process.env.ALLOWED_MIME_TYPES || "image/jpeg,image/png,application/pdf").split(","),
  TEMP_UPLOAD_DIR: process.env.TEMP_UPLOAD_DIR || "./tmp/uploads",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes default
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100), // 100 requests per windowMs

  // Cache settings
  CACHE_TTL: Number(process.env.CACHE_TTL || 3600), // 1 hour default

  // Database connection
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/accounting",

  // JWT for authentication
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // AWS S3 Storage
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "my-invoice-bucket",

  // Server settings
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
}

// Validate required environment variables
export function validateEnv(): string[] {
  const errors: string[] = []

  // Check for required variables in production
  if (env.NODE_ENV === "production") {
    if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
      errors.push("GOOGLE_APPLICATION_CREDENTIALS is required in production")
    }

    if (!env.JWT_SECRET || env.JWT_SECRET === "your-secret-key-change-in-production") {
      errors.push("JWT_SECRET must be changed in production")
    }

    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      errors.push("AWS credentials are required in production")
    }

    if (!env.DATABASE_URL || env.DATABASE_URL === "mongodb://localhost:27017/accounting") {
      errors.push("A proper DATABASE_URL must be provided in production")
    }
  }

  return errors
}
