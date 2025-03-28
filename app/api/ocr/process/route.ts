import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Hardcoded OCR API credentials (as provided in your example)
    const username = "RAMI"
    const licenseCode = "F5D38AC1-0D82-4D17-93AA-CC8E2450B302"

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileData = Buffer.from(arrayBuffer)

    // OCR API endpoint
    const requestUrl = "https://www.ocrwebservice.com/restservices/processDocument?gettext=true"

    // Create authorization header
    const authHeader = "Basic " + Buffer.from(`${username}:${licenseCode}`).toString("base64")

    console.log("Sending request to OCR service...")

    // Send request to OCR service
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/octet-stream",
      },
      body: fileData,
    })

    console.log("OCR service response status:", response.status)

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized: Invalid OCR API credentials" }, { status: 401 })
      }
      return NextResponse.json(
        { error: `OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("OCR service response:", JSON.stringify(data).substring(0, 200) + "...")

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

