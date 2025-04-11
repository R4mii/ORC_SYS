import { type NextRequest, NextResponse } from "next/server"

/**
 * Configuration to disable Next.js body parsing
 * This is necessary when handling file uploads
 */
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    // n8n workflow form URL
    const n8nFormUrl = "https://r4mii.app.n8n.cloud/form/6323ea8b-3074-46ae-973a-52fae5cd24e2"

    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Log file information
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file) // Using the field name 'invoice1' as requested

    console.log("Sending request to n8n OCR service...")

    // Send file data to the n8n workflow
    const response = await fetch(n8nFormUrl, {
      method: "POST",
      body: n8nFormData,
    })

    console.log(`n8n OCR service response status: ${response.status}`)

    // Handle HTTP errors
    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    // Parse the JSON response
    const data = await response.json()
    console.log(`n8n OCR service response received`)

    // Return the n8n workflow response directly
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing OCR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
