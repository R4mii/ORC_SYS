import { type NextRequest, NextResponse } from "next/server"

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

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file) // Using the field name 'invoice1' as requested

    // Send file data to the n8n workflow
    const response = await fetch(n8nFormUrl, {
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
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
