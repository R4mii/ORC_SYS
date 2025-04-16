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

    console.log(`Forwarding request to OCR service at: ${n8nWebhookUrl.substring(0, 20)}...`)

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000) // 55 second timeout

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
        console.error(`n8n OCR service returned status: ${response.status}, body: ${errorText}`)

        // For debugging purposes, log the response headers
        console.log("Response headers:", Object.fromEntries([...response.headers.entries()]))

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
        console.log("OCR service response received successfully")

        // Return the response data
        return NextResponse.json(data)
      } catch (jsonError) {
        console.error("Failed to parse OCR service response:", jsonError)
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

      console.error("Fetch error:", fetchError)

      let errorMessage = "Failed to forward request to OCR service"
      if (fetchError instanceof Error) {
        errorMessage += `: ${fetchError.message}`
      }

      if (fetchError.name === "AbortError") {
        console.error("Fetch request timed out")

        // Use our fallback URL as an alternative
        try {
          console.log("Attempting to use fallback OCR service...")
          const formData = new FormData()
          formData.append("file", file)

          const fallbackResponse = await fetch("/api/ocr/process", {
            method: "POST",
            body: formData,
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            console.log("Fallback OCR service response received successfully")
            return NextResponse.json(fallbackData)
          } else {
            throw new Error(`Fallback service returned status: ${fallbackResponse.status}`)
          }
        } catch (fallbackError) {
          console.error("Fallback OCR service also failed:", fallbackError)
          return NextResponse.json(
            {
              error: "OCR processing timed out",
              details:
                "The OCR service took too long to respond and fallback also failed. Please try again with a smaller file.",
            },
            { status: 504 },
          )
        }
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
