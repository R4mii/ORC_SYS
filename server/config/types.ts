import type { Request } from "express"

// Define custom error type for better error handling
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// Request with file from multer
export interface FileRequest extends Request {
  file?: Express.Multer.File
}

// OCR request types
export interface OCROptions {
  useCache?: boolean
  preferredLanguage?: string
}

export interface OCRResult {
  rawText: string
  confidence?: number
  lang?: string
  processingTimeMs?: number
}

// Invoice data structure
export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  amountWithTax: number
  amount: number
  vatAmount: number
  supplier: string
  rawText: string
}

// API response structure
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp?: number
}

// Define type for validated environment variables
export interface EnvVars {
  NODE_ENV: "development" | "production" | "test"
  PORT: number
  FRONTEND_URL: string
  TEMP_UPLOAD_DIR?: string
  MAX_FILE_SIZE: number
  ALLOWED_MIME_TYPES: string
  OCR_USER_NAME?: string
  OCR_LICENSE_CODE?: string
  LOG_LEVEL: "error" | "warn" | "info" | "debug"
}
