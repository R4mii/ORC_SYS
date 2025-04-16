import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier n'a été fourni" }, { status: 400 })
    }

    // Convert file to FormData for the webhook
    const webhookFormData = new FormData()
    webhookFormData.append("file", file)
    webhookFormData.append("documentType", "bankStatement")

    // Send to n8n webhook
    const webhookUrl = "https://ocr-sys-u41198.vm.elestio.app/webhook/uprelev"

    // For testing purposes, we'll simulate a successful response
    // In production, uncomment the fetch call below
    /*
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: webhookFormData,
    })

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`)
    }

    const data = await response.json()
    */

    // Simulated response for testing
    const simulatedData = {
      success: true,
      fields: {
        accountHolder: "MOHAMMED AMINE",
        bank: "BANK POPULAIRE",
        accountNumber: "181 810 21211 4400338",
        statementDate: "31/03/2023",
        previousBalance: "24,530.75 MAD",
        newBalance: "32,145.20 MAD",
      },
    }

    return NextResponse.json(simulatedData)
  } catch (error) {
    console.error("Error processing bank statement:", error)
    return NextResponse.json(
      { error: "Une erreur s'est produite lors du traitement du relevé bancaire" },
      { status: 500 },
    )
  }
}
