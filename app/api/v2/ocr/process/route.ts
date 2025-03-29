import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds the 10MB limit" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Please upload a PDF or image (JPG, PNG)" },
        { status: 400 },
      )
    }

    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create a simulated OCR response
    const ocrResponse = {
      rawText: `HITECK LAND
91 Lotissement ABDELMOUMEN
Capital: 5.000.000,00
R.C.S: 123456
Patente: 12345678
ICE: 001234567890123

Facture N° : FA21 20210460

DATE        CLIENT
13/02/2021  003119

Référence   Désignation                 Qté   P.U.HT    Montant HT
01.0001     Produit A                   10    129,99    1.299,90
06.3633     Produit B                   11    90,35     993,85
12.0000     Produit C                   8     127,50    1.020,00
9           Produit D                   5     130,00    650,00
5           Produit E                   10    164,13    1.641,30

TVA 20%
Montant HT: 5.605,00 DH
Montant TVA: 1.121,00 DH
Droits de timbre: 0,00 DH
Débours: 0,00 DH
Montant TTC: 6.726,00 DH

À payer: Six mille sept cent vingt-six dirhams

Mode de paiement: Virement bancaire
Échéance: 15/03/2021

Coordonnées bancaires:
IBAN: MA123456789012345678901234
BIC: BMCEMAMC

Merci pour votre confiance!`,
      invoice: {
        supplier: "HITECK LAND",
        invoiceNumber: "FA21 20210460",
        invoiceDate: "13/02/2021",
        amount: 5605.0,
        vatAmount: 1121.0,
        amountWithTax: 6726.0,
        currency: "MAD",
        confidence: 0.85,
      },
    }

    return NextResponse.json(ocrResponse)
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "An error occurred during OCR processing" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "OCR API is running. Use POST to process documents." }, { status: 200 })
}

