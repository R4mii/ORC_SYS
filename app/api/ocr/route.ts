import { type NextRequest, NextResponse } from "next/server"

// Route Segment Configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a new FormData object to send to n8n
    const n8nFormData = new FormData()
    n8nFormData.append("invoice1", file)

    // Send file data to the n8n workflow
    const response = await fetch("https://ocr-sys-u41198.vm.elestio.app/webhook/upload", {
      method: "POST",
      body: n8nFormData,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    // Parse and return the response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing OCR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
