// OCR processing logic using n8n workflow

// Function to process an invoice image
export async function processInvoiceImage(fileBuffer: ArrayBuffer) {
  try {
    // Convert ArrayBuffer to base64
    const base64Image = Buffer.from(fileBuffer).toString("base64")

    // Call the n8n workflow through our API route
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    })

    if (!response.ok) {
      throw new Error(`OCR processing failed with status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error processing image:", error)
    throw error
  }
}

// Function to extract invoice data from OCR text
export function extractInvoiceData(text: string) {
  // Basic extraction logic - in a real app, this would be more sophisticated
  const invoiceNumberMatch = text.match(/(?:invoice|facture|inv)[^\d]*(\d+[-\s]?\d+)/i)
  const dateMatch = text.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
  const amountMatch = text.match(/(?:total|amount|montant)[^\d]*(\d+(?:[.,]\d+)?)/i)
  const supplierMatch = text.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^\n]+)/i)

  return {
    invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1].trim() : "",
    date: dateMatch ? dateMatch[1].trim() : "",
    amount: amountMatch ? Number.parseFloat(amountMatch[1].replace(",", ".")) : 0,
    supplier: supplierMatch ? supplierMatch[1].trim() : "Unknown Supplier",
  }
}
