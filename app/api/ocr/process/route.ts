import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get OCR API credentials from environment variables
    const username = process.env.OCR_USER_NAME
    const licenseCode = process.env.OCR_LICENSE_CODE

    if (!username || !licenseCode) {
      return NextResponse.json({ error: "OCR service not configured properly" }, { status: 500 })
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileData = Buffer.from(arrayBuffer)

    // OCR API endpoint
    const requestUrl = "https://www.ocrwebservice.com/restservices/processDocument?gettext=true"

    // Create authorization header
    const authHeader = "Basic " + Buffer.from(`${username}:${licenseCode}`).toString("base64")

    // Send request to OCR service
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": file.type,
      },
      body: fileData,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Check for error message in the response
    if (data.ErrorMessage) {
      return NextResponse.json({ error: `OCR Error: ${data.ErrorMessage}` }, { status: 400 })
    }

    // Extract OCR text from response
    const ocrText = data.OCRText?.[0]?.[0] || ""

    if (!ocrText) {
      return NextResponse.json({ error: "No text was extracted from the document" }, { status: 400 })
    }

    // Return the OCR results
    return NextResponse.json({
      success: true,
      taskDescription: data.TaskDescription,
      availablePages: data.AvailablePages,
      processedPages: data.ProcessedPages,
      ocrText: ocrText,
    })
  } catch (error) {
    console.error("Error processing OCR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

