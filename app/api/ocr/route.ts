import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"
import { v4 as uuidv4 } from "uuid"
import logger from "@/lib/services/logging-service"

// Rate limiting implementation for Next.js App Router
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: "Too many requests, please try again later",
}

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    const now = Date.now()
    const rateLimit = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT.windowMs }

    if (rateLimit.resetTime < now) {
      // Reset if window has passed
      rateLimit.count = 1
      rateLimit.resetTime = now + RATE_LIMIT.windowMs
    } else {
      rateLimit.count += 1
    }

    rateLimitStore.set(ip, rateLimit)

    if (rateLimit.count > RATE_LIMIT.max) {
      return NextResponse.json(
        { error: RATE_LIMIT.message },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetTime - now) / 1000)) } },
      )
    }

    // Process the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      )
    }

    // Validate file type
    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 },
      )
    }

    // Get language preference if provided
    const preferredLanguage = (formData.get("language") as string) || undefined

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a unique filename to prevent collisions
    const tempDir = os.tmpdir()
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const tempFilePath = path.join(tempDir, uniqueFilename)

    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, buffer)

    try {
      // Process the image with OCRWebService.com
      const ocrText = await processImageWithOCR(tempFilePath, {
        preferredLanguage,
      })

      // Parse the OCR text to extract invoice data
      const invoiceData = parseInvoiceData(ocrText)

      // Return the processed data
      return NextResponse.json({
        success: true,
        data: {
          ...invoiceData,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      })
    } catch (error) {
      // Handle OCR-specific errors
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          return NextResponse.json({ error: "Unauthorized: Invalid OCR API credentials" }, { status: 401 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      throw error
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath)
      } catch (e) {
        console.error("Error deleting temp file:", e)
      }
    }
  } catch (error) {
    // Log error
    logger.error("Error processing OCR request:", error)

    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}

