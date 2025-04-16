import { type NextRequest, NextResponse } from "next/server"

// Set a longer timeout for this API route
export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not set")
      return NextResponse.json({ error: "OCR service configuration error" }, { status: 500 })
    }

    console.log("N8N_WEBHOOK_URL:", n8nWebhookUrl)
    console.log("Using N8N webhook URL:", n8nWebhookUrl)

    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Log file details for debugging
    console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type)

    // Check file type
    const fileType = file.type.toLowerCase()
    const isValidType =
      fileType.includes("pdf") ||
      fileType.includes("image/jpeg") ||
      fileType.includes("image/png") ||
      fileType.includes("image/jpg")

    if (!isValidType) {
      return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, and PNG are supported." }, { status: 400 })
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file) // Using the field name 'invoice1' as requested

    console.log("Sending request to n8n webhook...")

    // Send file data to the n8n workflow with a longer timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55 second timeout

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        body: n8nFormData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorMessage = `n8n OCR service returned status: ${response.status}`
        console.error(errorMessage)
        return NextResponse.json({ error: errorMessage }, { status: response.status })
      }

      console.log("Received successful response from n8n")

      // Parse the JSON response
      const data = await response.json()

      // Return the n8n workflow response
      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        console.error("Fetch request timed out")
        return NextResponse.json({ error: "OCR processing timed out" }, { status: 504 })
      }
      throw fetchError
    }
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
