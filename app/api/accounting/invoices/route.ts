import { type NextRequest, NextResponse } from "next/server"

/**
 * API route handler for saving invoice data to the accounting system
 * @param req - The incoming request with invoice data
 * @returns JSON response with the result
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body from the request
    const invoiceData = await req.json()

    // Validate required fields
    const requiredFields = ["supplier", "invoiceNumber", "date", "totalAmount"]
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // In a real implementation, you would:
    // 1. Connect to your accounting system API
    // 2. Format the data according to the API requirements
    // 3. Send the data and handle the response

    // For this demo, we'll simulate a successful API call

    // Generate a unique reference number
    const accountingReference = `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Invoice data successfully saved to accounting system",
      reference: accountingReference,
      data: {
        ...invoiceData,
        status: "pending_approval",
        processedAt: new Date().toISOString(),
        accountingReference,
      },
    })
  } catch (error) {
    console.error("Error saving invoice data:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
        errorDetails: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

