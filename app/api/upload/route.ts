import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = (formData.get("documentType") as string) || "default"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create a new FormData instance for forwarding the file
    const forwardFormData = new FormData()
    forwardFormData.append("file", file)

    // Determine the webhook URL based on document type
    let webhookUrl = "https://ocr-sys-u41198.vm.elestio.app/webhook/upload"

    if (documentType === "bankStatements") {
      webhookUrl = "https://ocr-sys-u41198.vm.elestio.app/webhook-test/uprelev"
    }

    // Forward the file to the appropriate n8n webhook
    const response = await fetch(webhookUrl, {
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
