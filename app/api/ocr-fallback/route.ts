// Create a new route that directly forwards to the n8n webhook
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not set")
      return NextResponse.json({ error: "OCR service configuration error" }, { status: 500 })
    }

    console.log("Using N8N webhook URL (fallback route):", n8nWebhookUrl)

    // Forward the request directly to n8n
    const formData = await req.formData()

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55 second timeout

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorMessage = `n8n OCR service returned status: ${response.status}`
        console.error(errorMessage)
        return NextResponse.json({ error: errorMessage }, { status: response.status })
      }

      console.log("Received successful response from n8n (fallback route)")

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
    console.error("OCR processing error (fallback route):", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
