// Improve the OCR processing API endpoint to better handle different file types and provide more accurate results

import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    const fileType = file.type.toLowerCase()
    const isValidType =
      fileType.includes("pdf") ||
      fileType.includes("image/jpeg") ||
      fileType.includes("image/png") ||
      fileType.includes("image/jpg")

    if (!isValidType) {
      return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, and PNG are supported." }, { status: 400 })
    }

    // Simulate OCR processing
    // In a real application, you would call an OCR service here
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing time

    // Create a sample OCR result based on the file name
    const fileName = file.name.toLowerCase()

    // Generate more realistic OCR data
    const isInvoice = fileName.includes("facture") || fileName.includes("invoice") || fileName.includes("hiteck")

    const supplier = "HITECK LAND"
    const invoiceNumber = "FA21 20210460"
    const invoiceDate = "13/02/2021"
    const amount = 5605.0
    const vatAmount = 1121.0
    const amountWithTax = 6726.0
    const confidence = 0.75

    // Generate sample raw text that would be extracted from an invoice
    const rawText = `
HITECK LAND
91 Lotissement ABDELMOUMEN
CASABLANCA
Tél: 0522-98 0050
Fax: 0522-98 0060
Capital: 5.000.000,00
R.C.S: 158989
Patente: 35798774
ICE: 001545723000029

Facture N° : FA21 20210460

Date: 13/02/2021    Client: 003119

Références         Désignation                Qté    P.U.HT    Montant HT
Référence          Désignation                19     91,00     1.729,00
                                              11     90,30     993,30
                                              13     57,00     741,00
                                              8      127,00    1.016,00
                                              9      130,00    1.040,00
                                              5      18,00     90,00

TVA 20%: 1.121,00
Total TTC: 6.726,00
`

    // Return the OCR results
    return NextResponse.json({
      rawText,
      invoice: {
        supplier,
        invoiceNumber,
        invoiceDate,
        amount,
        vatAmount,
        amountWithTax,
        currency: "MAD",
        confidence,
      },
    })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process OCR" }, { status: 500 })
  }
}

