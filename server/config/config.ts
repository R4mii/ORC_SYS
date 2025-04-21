import path from "path"
import { z } from "zod"

// Define environment variable schema with validation
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess((val) => Number(val), z.number().positive().default(8080)),

  // CORS configuration
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // File upload configuration
  TEMP_UPLOAD_DIR: z
    .string()
    .optional()
    .default(path.join(process.cwd(), "server", "uploads")),
  MAX_FILE_SIZE: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .positive()
      .default(10 * 1024 * 1024), // 10MB
  ),
  ALLOWED_MIME_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),

  // OCR service configuration
  OCR_USER_NAME: z.string().optional(),
  OCR_LICENSE_CODE: z.string().optional(),

  // Logging configuration
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
})

// Function to validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors)
    throw new Error("Invalid environment variables")
  }

  return parsed.data
}

// Export validated and typed environment variables
export const env = validateEnv()

// Export configuration constants
export const CONFIG = {
  isProd: env.NODE_ENV === "production",
  isDev: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",

  server: {
    port: env.PORT,
  },

  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },

  upload: {
    tempDir: env.TEMP_UPLOAD_DIR,
    maxFileSize: env.MAX_FILE_SIZE,
    allowedMimeTypes: env.ALLOWED_MIME_TYPES.split(","),
  },

  ocr: {
    username: env.OCR_USER_NAME,
    licenseCode: env.OCR_LICENSE_CODE,
  },

  logging: {
    level: env.LOG_LEVEL,
  },
}
