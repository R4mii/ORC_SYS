import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60 // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
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

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return simulated OCR result based on file type and name
    const isInvoice =
      file.name.toLowerCase().includes("facture") ||
      file.name.toLowerCase().includes("invoice") ||
      fileType.includes("pdf")

    if (isInvoice) {
      return NextResponse.json({
        success: true,
        rawText: `FACTURE N° F2023-0042

Fournisseur: ACME SERVICES SARL
Adresse: 123 Avenue Mohammed V, Casablanca
Tél: 05 22 12 34 56
Email: contact@acmeservices.ma

Client: EXPERIO TUTO
Adresse: 45 Rue des Fleurs, Rabat

Date: 15/03/2023
Référence: CMD-2023-105

Désignation                  Quantité    Prix unitaire    Montant HT
-----------------------------------------------------------------
Consultation technique          5           800.00         4,000.00
Formation logiciel              2         1,500.00         3,000.00
Maintenance mensuelle           1         2,000.00         2,000.00

Total HT                                                   9,000.00
TVA 20%                                                    1,800.00
Total TTC                                                 10,800.00

Mode de paiement: Virement bancaire
Date d'échéance: 15/04/2023

RIB: 123456789012345678901234
Banque: Bank Al-Maghrib

Merci pour votre confiance!`,
        invoice: {
          supplier: "ACME SERVICES SARL",
          invoiceNumber: "F2023-0042",
          invoiceDate: "15/03/2023",
          amount: 9000,
          vatAmount: 1800,
          amountWithTax: 10800,
          currency: "MAD",
          confidence: 0.92,
        },
      })
    } else {
      // Generic document response
      return NextResponse.json({
        success: true,
        rawText: `Document: ${file.name}
Type: ${file.type}
Size: ${file.size} bytes

This is a generic text extraction for non-invoice documents.
The OCR system has extracted this placeholder text as an example.

For better results with invoice data extraction, please upload an invoice document.`,
        document: {
          name: file.name,
          type: file.type,
          size: file.size,
          extractedAt: new Date().toISOString(),
          confidence: 0.7,
        },
      })
    }
  } catch (error) {
    console.error("OCR fallback processing error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
