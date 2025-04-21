import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a new FormData instance for forwarding the file
    const forwardFormData = new FormData()
    forwardFormData.append("file", file)

    // Forward the file to the n8n webhook
    const response = await fetch("https://primary-production-14c1.up.railway.app/webhook/upload", {
      method: "POST",
      body: forwardFormData,
    })

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
