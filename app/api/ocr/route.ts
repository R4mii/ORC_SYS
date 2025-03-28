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

/**
 * Extract invoice data from OCR text using regular expressions
 * @param ocrText - The raw text extracted from the OCR service
 * @returns Structured invoice data object
 */
function extractInvoiceData(ocrText: string) {
  // Initialize invoice object
  const invoice: Record<string, any> = {}

  // Extract invoice number
  const invoiceNumberMatch =
    ocrText.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*(\d+[-\s]?\d+)/i) ||
    ocrText.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*([A-Z0-9][-A-Z0-9/]+)/i)
  if (invoiceNumberMatch) {
    invoice.invoiceNumber = invoiceNumberMatch[1].trim()
  }

  // Extract invoice date
  const dateMatch =
    ocrText.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i) ||
    ocrText.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
  if (dateMatch) {
    invoice.date = dateMatch[1].trim()
  }

  // Extract supplier name
  const supplierMatch =
    ocrText.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^\n]+)/i) ||
    ocrText.match(/(?:société|company|raison sociale)[^:]*(?::|)\s*([^\n]+)/i)
  if (supplierMatch) {
    invoice.supplier = supplierMatch[1].trim()
  } else {
    // If no supplier found, try to extract from the top of the document
    const lines = ocrText.split("\n").slice(0, 5) // Check first 5 lines
    for (const line of lines) {
      // Look for a line that might be a company name (all caps, or contains SARL, SA, etc.)
      if (/^[A-Z\s]{5,}$/.test(line) || /\b(?:SARL|SA|SAS|EURL|SASU)\b/.test(line)) {
        invoice.supplier = line.trim()
        break
      }
    }
  }

  // Extract total amount
  const totalMatch =
    ocrText.match(/(?:total\s*ttc|montant\s*total|total\s*amount)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
    ocrText.match(/(?:total)[^0-9€$]*([0-9\s,.]+)[€$\s]*(?:dh|mad|dirham)/i) ||
    ocrText.match(/(?:à\s*payer|to\s*pay)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
  if (totalMatch) {
    // Clean up the number: remove spaces, replace comma with dot
    const cleanNumber = totalMatch[1].replace(/\s/g, "").replace(",", ".")
    invoice.totalAmount = cleanNumber
  }

  // Extract subtotal (amount without tax)
  const subtotalMatch =
    ocrText.match(/(?:sous\s*total|subtotal|total\s*ht|montant\s*ht)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
    ocrText.match(/(?:ht|hors\s*taxe)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
  if (subtotalMatch) {
    const cleanNumber = subtotalMatch[1].replace(/\s/g, "").replace(",", ".")
    invoice.subtotal = cleanNumber
  }

  // Extract VAT amount
  const vatMatch =
    ocrText.match(/(?:tva|t\.v\.a\.|vat)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
    ocrText.match(/(?:montant\s*(?:tva|t\.v\.a\.|vat))[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
  if (vatMatch) {
    const cleanNumber = vatMatch[1].replace(/\s/g, "").replace(",", ".")
    invoice.vatAmount = cleanNumber
  }

  // Extract currency
  const currencyMatch = ocrText.match(/(?:€|\$|£|MAD|DH|DHs|EUR|USD|GBP)/i)
  if (currencyMatch) {
    const currencyMap: Record<string, string> = {
      "€": "EUR",
      $: "USD",
      "£": "GBP",
      MAD: "MAD",
      DH: "MAD",
      DHs: "MAD",
      EUR: "EUR",
      USD: "USD",
      GBP: "GBP",
    }
    invoice.currency = currencyMap[currencyMatch[0].toUpperCase()] || "MAD"
  } else {
    invoice.currency = "MAD" // Default currency
  }

  return invoice
}

/**
 * API route handler for OCR processing
 * @param req - The incoming request
 * @returns JSON response with OCR results
 */
export async function POST(req: NextRequest) {
  try {
    // OCR API credentials (hard-coded as requested)
    const username = "RAMI"
    const licenseCode = "F5D38AC1-0D82-4D17-93AA-CC8E2450B302"

    // OCR API endpoint
    const requestUrl = "https://www.ocrwebservice.com/restservices/processDocument?gettext=true"

    // Create a temporary file path for storing the uploaded file
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Log file information
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    // Convert file to array buffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileData = Buffer.from(arrayBuffer)

    // Create authorization header for Basic Auth
    const authHeader = "Basic " + Buffer.from(`${username}:${licenseCode}`).toString("base64")

    console.log("Sending request to OCR service...")

    // Send file data to the OCR API
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/octet-stream",
      },
      body: fileData,
    })

    console.log(`OCR service response status: ${response.status}`)

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized: Invalid OCR API credentials" }, { status: 401 })
      }
      return NextResponse.json(
        { error: `OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    // Parse the JSON response
    const data = await response.json()
    console.log(`OCR service response: ${JSON.stringify(data).substring(0, 200)}...`)

    // Check for error message in the response
    if (data.ErrorMessage) {
      return NextResponse.json({ error: `OCR Error: ${data.ErrorMessage}` }, { status: 400 })
    }

    // Extract OCR text from response
    const ocrText = data.OCRText?.[0]?.[0] || ""

    if (!ocrText) {
      return NextResponse.json({ error: "No text was extracted from the document" }, { status: 400 })
    }

    // Parse the OCR text to extract invoice details
    const invoice = extractInvoiceData(ocrText)

    // Calculate confidence score based on how many fields were successfully extracted
    const extractedFields = Object.keys(invoice).filter((key) => !!invoice[key]).length
    const confidence = Math.min(1, extractedFields / 5) // 5 is the total number of fields we try to extract

    // Return the structured invoice data along with OCR details
    return NextResponse.json({
      success: true,
      taskDescription: data.TaskDescription,
      availablePages: data.AvailablePages,
      processedPages: data.ProcessedPages,
      confidence,
      invoice,
      rawText: ocrText,
    })
  } catch (error) {
    console.error("Error processing OCR:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

