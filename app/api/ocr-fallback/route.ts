import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Get the n8n webhook URL directly from the environment variable
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL environment variable is not set")
      return NextResponse.json({ error: "OCR service configuration error" }, { status: 500 })
    }

    console.log("Using N8N webhook URL directly:", n8nWebhookUrl)

    // Get the form data from the request
    const formData = await req.formData()

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()

    // Copy all fields from the original formData to the new one
    for (const [key, value] of formData.entries()) {
      n8nFormData.append(key, value)
    }

    // Send directly to n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      body: n8nFormData,
    })

    if (!response.ok) {
      const errorMessage = `n8n OCR service returned status: ${response.status}`
      console.error(errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // Parse the JSON response
    const data = await response.json()

    // Return the n8n workflow response
    return NextResponse.json(data)
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
