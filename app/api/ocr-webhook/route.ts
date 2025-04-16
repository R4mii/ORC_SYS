import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "../middleware/rate-limiter"
import { validateFile } from "@/lib/utils/file-validation"
import { logger } from "@/lib/services/logger"
import { env } from "@/lib/env.config"

export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  // Apply rate limiting - more strict for OCR processing
  const rateLimit = rateLimiter(req, {
    maxRequests: 10, // Limit to 10 requests per window
    windowMs: 5 * 60 * 1000, // 5 minute window
  })

  // Return early if rate limit exceeded
  if (rateLimit) return rateLimit

  try {
    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      logger.warn("No file provided in OCR request", "OCR-Webhook")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate the file
    const validationResult = validateFile(file, {
      maxSize: env.upload.maxSize,
      allowedTypes: env.upload.allowedTypes,
    })

    if (!validationResult.valid) {
      logger.warn(`Invalid file: ${validationResult.error}`, "OCR-Webhook", {
        filename: file.name,
        size: file.size,
        type: file.type,
      })
      return NextResponse.json({ error: validationResult.error }, { status: 400 })
    }

    // Get the webhook URL from environment variable
    const n8nWebhookUrl = env.ocr.webhookUrl

    if (!n8nWebhookUrl) {
      logger.error("N8N_WEBHOOK_URL environment variable is not set", "OCR-Webhook")
      return NextResponse.json(
        {
          error: "OCR service configuration error",
          details: "Webhook URL is not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    logger.info(`Processing OCR request for file: ${file.name}`, "OCR-Webhook", {
      size: file.size,
      type: file.type,
    })

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), env.ocr.timeout) // Use configured timeout

    try {
      // Forward the file to the n8n webhook
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        body: n8nFormData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error text available")
        logger.error(`OCR service error: ${response.status}`, "OCR-Webhook", {
          status: response.status,
          errorText: errorText.substring(0, 200), // Limit error text length
        })

        return NextResponse.json(
          {
            error: `OCR service error: ${response.status}`,
            details: errorText.substring(0, 200), // Limit error text length
          },
          { status: response.status },
        )
      }

      // Parse the JSON response
      try {
        const data = await response.json()
        logger.info("OCR service response received successfully", "OCR-Webhook")

        // Return the response data
        return NextResponse.json(data)
      } catch (jsonError) {
        logger.error("Failed to parse OCR service response", "OCR-Webhook", { error: jsonError })
        return NextResponse.json(
          {
            error: "Invalid response from OCR service",
            details: "The service returned an invalid JSON response",
          },
          { status: 500 },
        )
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)

      logger.error("Fetch error in OCR webhook", "OCR-Webhook", { error: fetchError })

      let errorMessage = "Failed to forward request to OCR service"
      if (fetchError instanceof Error) {
        errorMessage += `: ${fetchError.message}`
      }

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            error: "OCR processing timed out",
            details: "The OCR service took too long to respond. Please try again with a smaller file.",
          },
          { status: 504 },
        )
      } else if (fetchError.message?.includes("ECONNREFUSED")) {
        return NextResponse.json(
          {
            error: "Connection refused by OCR service",
            details: "The OCR service is not reachable. Please check the service status and try again.",
          },
          { status: 500 },
        )
      } else if (fetchError.message?.includes("ENOTFOUND")) {
        return NextResponse.json(
          {
            error: "OCR service host not found",
            details: "The OCR service host could not be resolved. Please check the service URL and try again.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    logger.error("Error processing OCR request", "OCR-Webhook", { error })
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
