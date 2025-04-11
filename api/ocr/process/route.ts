import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For demo purposes, we'll simulate OCR processing
    // This avoids any issues with the external OCR API
    console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return simulated OCR result
    return NextResponse.json({
      success: true,
      rawText: `FACTURE N° F2023-0042\n\nFournisseur: ACME SERVICES SARL\nAdresse: 123 Avenue Mohammed V, Casablanca\nTél: 05 22 12 34 56\nEmail: contact@acmeservices.ma\n\nClient: EXPERIO TUTO\nAdresse: 45 Rue des Fleurs, Rabat\n\nDate: 15/03/2023\nRéférence: CMD-2023-105\n\nDésignation                  Quantité    Prix unitaire    Montant HT\n-----------------------------------------------------------------\nConsultation technique          5           800.00         4,000.00\nFormation logiciel              2         1,500.00         3,000.00\nMaintenance mensuelle           1         2,000.00         2,000.00\n\nTotal HT                                                   9,000.00\nTVA 20%                                                    1,800.00\nTotal TTC                                                 10,800.00\n\nMode de paiement: Virement bancaire\nDate d'échéance: 15/04/2023\n\nRIB: 123456789012345678901234\nBanque: Bank Al-Maghrib\n\nMerci pour votre confiance!`,
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
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
