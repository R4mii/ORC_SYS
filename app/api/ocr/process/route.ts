import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // OCR.space API credentials - using your provided key
    const apiKey = "K83121963488957"

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileData = Buffer.from(arrayBuffer)

    // OCR.space API endpoint
    const requestUrl = "https://api.ocr.space/parse/image"

    // Create form data for OCR.space API
    const ocrFormData = new FormData()
    ocrFormData.append("apikey", apiKey)
    ocrFormData.append("language", "fre") // French language for Moroccan invoices
    ocrFormData.append("isOverlayRequired", "false")
    ocrFormData.append("OCREngine", "2") // More accurate OCR engine
    ocrFormData.append("scale", "true")

    // Append the file to the form data
    ocrFormData.append("file", new Blob([fileData]), file.name)

    console.log("Sending request to OCR.space API...")

    // Send request to OCR.space API
    const response = await fetch(requestUrl, {
      method: "POST",
      body: ocrFormData,
    })

    console.log("OCR.space API response status:", response.status)

    if (!response.ok) {
      return NextResponse.json(
        { error: `OCR service returned status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("OCR.space API response:", JSON.stringify(data).substring(0, 200) + "...")

    // Check for error in the OCR response
    if (data.OCRExitCode !== 1) {
      return NextResponse.json({ error: `OCR Error: ${data.ErrorMessage || "Unknown error"}` }, { status: 400 })
    }

    // Extract OCR text from response
    const ocrText = data.ParsedResults?.[0]?.ParsedText || ""

    if (!ocrText) {
      return NextResponse.json({ error: "No text was extracted from the document" }, { status: 400 })
    }

    // Extract invoice data using regex patterns similar to the Python script
    const extractedData = extractInvoiceData(ocrText)

    // Return the structured invoice data along with OCR details
    return NextResponse.json({
      success: true,
      taskDescription: "OCR Processing Complete",
      availablePages: 1,
      processedPages: 1,
      confidence: extractedData.confidence || 0.7,
      invoice: extractedData,
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

// Function to extract invoice data from OCR text using regex patterns
function extractInvoiceData(text: string) {
  // Initialize invoice object
  const invoice: Record<string, any> = {
    confidence: 0.7,
  }

  try {
    // Extract supplier name
    const supplierMatch =
      text.match(/Societe\s+([\w&]+)/i) || text.match(/(?:fournisseur|supplier)[^:]*(?::|)\s*([^\n]+)/i)
    if (supplierMatch) {
      invoice.supplier = supplierMatch[1].trim()
    } else {
      invoice.supplier = "Not found"
    }

    // Extract invoice number
    const invoiceNumberMatch =
      text.match(/N°\s*Facture\s*:\s*(\d+)/i) ||
      text.match(/(?:facture|invoice|fact)[^\d]*(?:n[°º]?)[^\d]*(\d+[-\s]?\d+)/i)
    if (invoiceNumberMatch) {
      invoice.invoiceNumber = invoiceNumberMatch[1].trim()
    } else {
      invoice.invoiceNumber = "Not found"
    }

    // Extract invoice date
    const dateMatch =
      text.match(/Date\s*Facture\s*:\s*(\d{2}\/\d{2}\/\d{4})/i) ||
      text.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    if (dateMatch) {
      invoice.invoiceDate = dateMatch[1].trim()
    } else {
      invoice.invoiceDate = "Not found"
    }

    // Extract amount without tax (HT)
    const amountHTMatch =
      text.match(/Montant\s*HT\s*:\s*([\d,.]+)/i) || text.match(/(?:total|montant)\s*ht[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (amountHTMatch) {
      const cleanNumber = amountHTMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.amount = Number.parseFloat(cleanNumber)
    } else {
      invoice.amount = 0
    }

    // Extract VAT amount
    const vatMatch =
      text.match(/Montant\s*TVA\s*$$.*?$$\s*:\s*([\d,.]+)/i) ||
      text.match(/(?:tva|t\.v\.a\.|vat)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (vatMatch) {
      const cleanNumber = vatMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.vatAmount = Number.parseFloat(cleanNumber)
    } else {
      invoice.vatAmount = 0
    }

    // Extract total amount with tax (TTC)
    const amountTTCMatch =
      text.match(/Montant\s*TTC\s*:\s*([\d,.]+)/i) ||
      text.match(/(?:total\s*ttc|montant\s*total|total\s*amount)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (amountTTCMatch) {
      const cleanNumber = amountTTCMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.amountWithTax = Number.parseFloat(cleanNumber)
    } else {
      invoice.amountWithTax = 0
    }

    // Set default currency for Morocco
    invoice.currency = "MAD"

    // Multiple VAT amounts (if present)
    const multipleVAT = text.match(/Montant\s*TVA\s*$$.*?$$\s*:\s*([\d,.]+)/gi)
    if (multipleVAT && multipleVAT.length > 1) {
      invoice.multipleVAT = multipleVAT.map((vat) => {
        const amount = vat.match(/:\s*([\d,.]+)/i)
        return amount ? amount[1].replace(/\s/g, "").replace(",", ".") : "0"
      })
    }

    // Calculate confidence score based on how many fields were successfully extracted
    const extractedFields = [
      invoice.invoiceNumber !== "Not found",
      invoice.invoiceDate !== "Not found",
      invoice.supplier !== "Not found",
      invoice.amount > 0,
      invoice.amountWithTax > 0,
      invoice.vatAmount > 0,
    ].filter(Boolean).length

    invoice.confidence = Math.min(1, extractedFields / 6)

    return invoice
  } catch (error) {
    console.error("Error extracting invoice data:", error)
    return invoice
  }
}

