import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64String = Buffer.from(buffer).toString("base64")

    // Prepare OCR API request
    const ocrFormData = new FormData()
    ocrFormData.append("base64Image", `data:${file.type};base64,${base64String}`)
    ocrFormData.append("language", "fre") // French language
    ocrFormData.append("isOverlayRequired", "true")
    ocrFormData.append("scale", "true")
    ocrFormData.append("isTable", "true")
    ocrFormData.append("OCREngine", "2") // Using OCR Engine 2 for better results

    // Call OCR.space API
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: "K83121963488957",
      },
      body: ocrFormData,
    })

    const ocrResult = await response.json()

    // Process OCR results
    if (ocrResult.OCRExitCode !== 1 && ocrResult.OCRExitCode !== 2) {
      return NextResponse.json({ error: ocrResult.ErrorMessage || "OCR processing failed" }, { status: 500 })
    }

    // Extract invoice data from OCR text
    const parsedResults = ocrResult.ParsedResults || []
    const rawText = parsedResults[0]?.ParsedText || ""

    // Extract invoice information using regex patterns
    const invoiceData = extractInvoiceData(rawText)

    return NextResponse.json({
      success: true,
      rawText,
      invoice: {
        ...invoiceData,
        confidence: parsedResults[0]?.TextOverlay?.Lines?.length > 0 ? 0.85 : 0.5,
      },
    })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}

function extractInvoiceData(text: string) {
  // Initialize invoice data
  const invoiceData: any = {
    supplier: "",
    invoiceNumber: "",
    invoiceDate: "",
    amount: 0,
    vatAmount: 0,
    amountWithTax: 0,
    currency: "MAD",
  }

  // Extract supplier name (usually at the top)
  const supplierMatch = text.match(/^([A-Z\s]+)/)
  if (supplierMatch) {
    invoiceData.supplier = supplierMatch[1].trim()
  }

  // Extract invoice number
  const invoiceNumberMatch =
    text.match(/Facture\s+N[°:]?\s*[:.]?\s*([A-Z0-9\-.]+)/i) || text.match(/N[°:]?\s*[:.]?\s*([A-Z0-9\-.]+)/i)
  if (invoiceNumberMatch) {
    invoiceData.invoiceNumber = invoiceNumberMatch[1].trim()
  }

  // Extract date
  const dateMatch =
    text.match(/Date\s*[:.]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i) ||
    text.match(/(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/)
  if (dateMatch) {
    invoiceData.invoiceDate = dateMatch[1].trim()
  }

  // Extract amounts
  const amountHTMatch =
    text.match(/Montant\s*HT\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i) || text.match(/HT\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i)
  if (amountHTMatch) {
    const amountStr = amountHTMatch[1].replace(/\s/g, "").replace(",", ".")
    invoiceData.amount = Number.parseFloat(amountStr)
  }

  // Extract VAT amount
  const vatMatch = text.match(/TVA\s*(\d+)?\s*%?\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i)
  if (vatMatch) {
    const vatStr = vatMatch[2].replace(/\s/g, "").replace(",", ".")
    invoiceData.vatAmount = Number.parseFloat(vatStr)
  }

  // Extract total amount with tax
  const ttcMatch =
    text.match(/Montant\s*TTC\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i) ||
    text.match(/TTC\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i) ||
    text.match(/Total\s*[:.]?\s*(\d+[\s\d]*[,.]\d+)/i)
  if (ttcMatch) {
    const ttcStr = ttcMatch[1].replace(/\s/g, "").replace(",", ".")
    invoiceData.amountWithTax = Number.parseFloat(ttcStr)
  } else if (invoiceData.amount && invoiceData.vatAmount) {
    // Calculate TTC if not found but HT and TVA are available
    invoiceData.amountWithTax = invoiceData.amount + invoiceData.vatAmount
  }

  return invoiceData
}

