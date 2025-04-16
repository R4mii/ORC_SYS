// __tests__/lib/ocr.test.ts
import { extractInvoiceData } from "@/lib/services/invoice-parser"
import { describe, it, expect } from "@jest/globals"

describe("extractInvoiceData", () => {
  it("should extract invoice data from OCR text", () => {
    const ocrText = `
      Facture
      Numéro: INV-2024-001
      Date: 15/04/2024
      Fournisseur: ACME Corp
      Total: 1200 MAD
      TVA: 200 MAD
    `

    const invoiceData = extractInvoiceData(ocrText)

    expect(invoiceData.invoiceNumber).toBe("INV-2024-001")
    expect(invoiceData.date).toBe("15/04/2024")
    expect(invoiceData.supplier.name).toBe("ACME Corp")
    expect(invoiceData.total).toBe(1200)
  })

  it("should handle missing data gracefully", () => {
    const ocrText = "Some random text without invoice data"
    const invoiceData = extractInvoiceData(ocrText)

    expect(invoiceData.invoiceNumber).toBe("")
    expect(invoiceData.date).toBe("")
    expect(invoiceData.supplier.name).toBe("")
    expect(invoiceData.total).toBe(0)
  })
})
