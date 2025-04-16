import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
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

    // Create a new FormData instance for forwarding the file
    const forwardFormData = new FormData()
    forwardFormData.append("file", file)

    // Get n8n webhook URL from environment variable or use default
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://ocr-sys-u41198.vm.elestio.app/webhook/upload"

    // Forward the file to the n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      body: forwardFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error from n8n webhook: ${response.status} ${errorText}`)
      return NextResponse.json({ error: `OCR service error: ${response.status}` }, { status: response.status })
    }

    // Return the response from the webhook
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
