import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

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

    // Get the webhook URL from environment variable
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not set")
      return NextResponse.json(
        {
          error: "OCR service configuration error",
          details: "Webhook URL is not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55 second timeout

    try {
      console.log(`Sending request to n8n webhook: ${n8nWebhookUrl}`)

      // Forward the file to the n8n webhook
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

      // Parse the JSON response
      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("Fetch request timed out")
        return NextResponse.json(
          {
            error: "OCR processing timed out",
            details: "The OCR service took too long to respond. Please try again with a smaller file.",
          },
          { status: 504 },
        )
      }

      console.error("Fetch error:", fetchError)
      return NextResponse.json(
        {
          error: "Failed to forward request to OCR service",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
