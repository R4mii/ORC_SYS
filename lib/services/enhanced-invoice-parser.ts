// Define the structure for invoice data
export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  supplier: {
    name: string
    address: string
    taxId?: string
  }
  customer: {
    name: string
    address: string
  }
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  paymentTerms?: string
  notes?: string
  confidence: number
  metadata?: Record<string, any>
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate?: number
}

// Extract structured invoice data from OCR text
export function extractInvoiceData(text: string): InvoiceData {
  // Initialize with default values
  const invoiceData: InvoiceData = {
    invoiceNumber: "",
    date: "",
    dueDate: "",
    supplier: {
      name: "",
      address: "",
    },
    customer: {
      name: "",
      address: "",
    },
    items: [],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    currency: "MAD", // Default currency for Moroccan context
    confidence: 0,
  }

  try {
    // Normalize text: remove extra spaces, normalize line breaks
    const normalizedText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").replace(/\n+/g, "\n").trim()

    // Extract invoice number - try multiple patterns
    const invoiceNumberPatterns = [
      /(?:facture|invoice|fact)[^\d]*(?:n[°º]?)[^\d]*(\d+[-\s]?\d+)/i,
      /(?:facture|invoice|fact)[^\d]*(?:n[°º]?)[^\d]*:?\s*([A-Z0-9][-A-Z0-9/]+)/i,
      /(?:n[°º]?)\s*(?:facture|invoice|fact)[^\d]*:?\s*([A-Z0-9][-A-Z0-9/]+)/i,
    ]

    for (const pattern of invoiceNumberPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.invoiceNumber = match[1].trim()
        break
      }
    }

    // Extract date - try multiple date formats
    const datePatterns = [
      /(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i,
      /(?:date)[^\d]*(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{2,4})/i,
      /(?:date)[^\d]*(\d{1,2}\s+(?:jan|fév|mar|avr|mai|juin|juil|août|sep|oct|nov|déc)[a-zéû]*\s+\d{2,4})/i,
      /(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i, // Fallback: look for any date format
    ]

    for (const pattern of datePatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.date = match[1].trim()
        break
      }
    }

    // Extract due date
    const dueDatePatterns = [
      /(?:échéance|due date|date d'échéance)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i,
      /(?:échéance|due date|date d'échéance)[^\d]*(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{2,4})/i,
    ]

    for (const pattern of dueDatePatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.dueDate = match[1].trim()
        break
      }
    }

    // Extract supplier name - look for common patterns in French and English
    const supplierPatterns = [
      /(?:fournisseur|supplier|émetteur|vendor)[^:]*(?::|)\s*([^\n]+)/i,
      /(?:société|company|raison sociale)[^:]*(?::|)\s*([^\n]+)/i,
    ]

    for (const pattern of supplierPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.supplier.name = match[1].trim()
        break
      }
    }

    // If no supplier found, try to extract from the top of the document
    if (!invoiceData.supplier.name) {
      // Often the supplier name is at the top of the invoice
      const lines = normalizedText.split("\n").slice(0, 5) // Check first 5 lines
      for (const line of lines) {
        // Look for a line that might be a company name (all caps, or contains SARL, SA, etc.)
        if (/^[A-Z\s]{5,}$/.test(line) || /\b(?:SARL|SA|SAS|EURL|SASU)\b/.test(line)) {
          invoiceData.supplier.name = line.trim()
          break
        }
      }
    }

    // Extract supplier address
    const addressPatterns = [/(?:adresse|address)[^:]*(?::|)\s*([^\n]+(?:\n[^a-z\n]+){0,3})/i]

    for (const pattern of addressPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.supplier.address = match[1].trim().replace(/\n/g, ", ")
        break
      }
    }

    // Extract tax ID (ICE for Morocco)
    const taxIdPatterns = [
      /(?:ICE|I\.C\.E)[^:]*(?::|)\s*([0-9]{15})/i,
      /(?:tax\s*id|numéro\s*fiscal|IF)[^:]*(?::|)\s*([0-9]{1,15})/i,
    ]

    for (const pattern of taxIdPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        invoiceData.supplier.taxId = match[1].trim()
        break
      }
    }

    // Extract total amount - look for patterns in French and English
    const totalPatterns = [
      /(?:total\s*ttc|montant\s*total|total\s*amount)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i,
      /(?:total)[^0-9€$]*([0-9\s,.]+)[€$\s]*(?:dh|mad|dirham)/i,
      /(?:à\s*payer|to\s*pay)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i,
    ]

    for (const pattern of totalPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        // Clean up the number: remove spaces, replace comma with dot
        const cleanNumber = match[1].replace(/\s/g, "").replace(",", ".")
        invoiceData.total = Number.parseFloat(cleanNumber)
        break
      }
    }

    // Extract subtotal
    const subtotalPatterns = [
      /(?:sous\s*total|subtotal|total\s*ht|montant\s*ht)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i,
      /(?:ht|hors\s*taxe)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i,
    ]

    for (const pattern of subtotalPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        const cleanNumber = match[1].replace(/\s/g, "").replace(",", ".")
        invoiceData.subtotal = Number.parseFloat(cleanNumber)
        break
      }
    }

    // If no subtotal found, estimate it from total
    if (invoiceData.subtotal === 0 && invoiceData.total > 0) {
      // Assume 20% VAT for Morocco if not specified
      invoiceData.subtotal = Math.round((invoiceData.total / 1.2) * 100) / 100
    }

    // Extract tax amount
    const taxPatterns = [
      /(?:tva|vat|taxe)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i,
      /(?:tva|vat|taxe)[^:]*(?::|)\s*([0-9\s,.]+)[€$\s]*/i,
    ]

    for (const pattern of taxPatterns) {
      const match = normalizedText.match(pattern)
      if (match && match[1]) {
        const cleanNumber = match[1].replace(/\s/g, "").replace(",", ".")
        invoiceData.taxAmount = Number.parseFloat(cleanNumber)
        break
      }
    }

    // If no tax amount found, calculate it from total and subtotal
    if (invoiceData.taxAmount === 0 && invoiceData.total > 0 && invoiceData.subtotal > 0) {
      invoiceData.taxAmount = Math.round((invoiceData.total - invoiceData.subtotal) * 100) / 100
    }

    // Extract currency
    const currencyPatterns = [/(?:€|\$|£|MAD|DH|DHs|EUR|USD|GBP)/i]

    for (const pattern of currencyPatterns) {
      const match = normalizedText.match(pattern)
      if (match) {
        const currencyMap: { [key: string]: string } = {
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
        invoiceData.currency = currencyMap[match[0].toUpperCase()] || "MAD"
        break
      }
    }

    // Extract items (simplified approach)
    // This is a basic implementation - in a real system, you'd need more sophisticated parsing
    const itemsSection = normalizedText.match(
      /(?:articles|items|description|désignation).*?(?:total|subtotal|amount)/is,
    )
    if (itemsSection) {
      const itemLines = itemsSection[0]
        .split("\n")
        .filter((line) => line.match(/\d+(?:[.,]\d+)?/) && !line.match(/(?:total|subtotal|amount|tax|vat|tva)/i))

      itemLines.forEach((line) => {
        // Very simplified parsing - would need refinement for real invoices
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 3) {
          const lastPart = parts[parts.length - 1]
          const secondLastPart = parts[parts.length - 2]
          const amount = Number.parseFloat(lastPart.replace(/[^\d.,]/g, "").replace(",", "."))

          if (!isNaN(amount)) {
            const quantity = Number.parseFloat(secondLastPart.replace(/[^\d.,]/g, "").replace(",", "."))
            const unitPrice = !isNaN(quantity) ? amount / quantity : amount
            const description = parts.slice(0, parts.length - (isNaN(quantity) ? 1 : 2)).join(" ")

            invoiceData.items.push({
              description,
              quantity: isNaN(quantity) ? 1 : quantity,
              unitPrice: isNaN(unitPrice) ? amount : unitPrice,
              amount,
            })
          }
        }
      })
    }

    // If no items were extracted, create a default item
    if (invoiceData.items.length === 0) {
      invoiceData.items.push({
        description: "Item from invoice",
        quantity: 1,
        unitPrice: invoiceData.subtotal,
        amount: invoiceData.subtotal,
      })
    }

    // Calculate confidence score based on how many fields were successfully extracted
    const extractedFields = [
      invoiceData.invoiceNumber,
      invoiceData.date,
      invoiceData.supplier.name,
      invoiceData.total > 0,
      invoiceData.subtotal > 0,
      invoiceData.taxAmount > 0,
    ].filter(Boolean).length

    invoiceData.confidence = Math.min(1, extractedFields / 6)

    return invoiceData
  } catch (error) {
    console.error("Error parsing invoice data:", error)
    // Return the basic structure even if parsing fails
    return invoiceData
  }
}
