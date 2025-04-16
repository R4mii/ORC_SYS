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
    forwardFormData.append("documentType", "bankStatements")

    // Use the bank statements webhook URL
    const webhookUrl = "https://ocr-sys-u41198.vm.elestio.app/webhook-test/uprelev"

    // Forward the file to the n8n webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: forwardFormData,
    })

    // Return the response from the webhook
    const data = await response.json()
    return NextResponse.json({
      ...data,
      fields: {
        accountHolder: data.accountHolder || "Not detected",
        bank: data.bank || "Not detected",
        accountNumber: data.accountNumber || "Not detected",
        statementDate: data.statementDate || "Not detected",
        previousBalance: data.previousBalance || "Not detected",
        newBalance: data.newBalance || "Not detected",
      },
    })
  } catch (error) {
    console.error("Error processing bank statement:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
