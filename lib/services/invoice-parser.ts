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
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
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
    currency: "USD", // Default currency
    confidence: 0,
  }

  try {
    // Extract invoice number
    const invoiceNumberMatch = text.match(/(?:invoice|facture|inv)[^\d]*(\d+[-\s]?\d+)/i)
    if (invoiceNumberMatch) {
      invoiceData.invoiceNumber = invoiceNumberMatch[1].trim()
    }

    // Extract date
    const dateMatch = text.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    if (dateMatch) {
      invoiceData.date = dateMatch[1].trim()
    }

    // Extract due date
    const dueDateMatch = text.match(/(?:due|échéance)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    if (dueDateMatch) {
      invoiceData.dueDate = dueDateMatch[1].trim()
    }

    // Extract supplier name
    const supplierMatch = text.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^\n]+)/i)
    if (supplierMatch) {
      invoiceData.supplier.name = supplierMatch[1].trim()
    }

    // Extract supplier address (simplified)
    const addressMatch = text.match(/(?:address|adresse)[^:]*(?::|)\s*([^\n]+(?:\n[^\n]+){0,3})/i)
    if (addressMatch) {
      invoiceData.supplier.address = addressMatch[1].trim().replace(/\n/g, ", ")
    }

    // Extract tax ID
    const taxIdMatch = text.match(/(?:tax\s*id|vat|tva|nif)[^:]*(?::|)\s*([^\n]+)/i)
    if (taxIdMatch) {
      invoiceData.supplier.taxId = taxIdMatch[1].trim()
    }

    // Extract total amount
    const totalMatch = text.match(/(?:total|amount|montant)[^\d]*(\d+(?:[.,]\d+)?)/i)
    if (totalMatch) {
      invoiceData.total = Number.parseFloat(totalMatch[1].replace(",", "."))
    }

    // Extract subtotal
    const subtotalMatch = text.match(/(?:subtotal|sous-total|net)[^\d]*(\d+(?:[.,]\d+)?)/i)
    if (subtotalMatch) {
      invoiceData.subtotal = Number.parseFloat(subtotalMatch[1].replace(",", "."))
    } else {
      // If no subtotal found, estimate it from total
      invoiceData.subtotal = Math.round((invoiceData.total / 1.2) * 100) / 100
    }

    // Extract tax amount
    const taxMatch = text.match(/(?:tax|vat|tva|taxe)[^\d]*(\d+(?:[.,]\d+)?)/i)
    if (taxMatch) {
      invoiceData.taxAmount = Number.parseFloat(taxMatch[1].replace(",", "."))
    } else {
      // If no tax amount found, calculate it from total and subtotal
      invoiceData.taxAmount = Math.round((invoiceData.total - invoiceData.subtotal) * 100) / 100
    }

    // Extract currency
    const currencyMatch = text.match(/(?:€|\$|£|EUR|USD|GBP|MAD|DH)/i)
    if (currencyMatch) {
      const currencyMap: { [key: string]: string } = {
        "€": "EUR",
        $: "USD",
        "£": "GBP",
        EUR: "EUR",
        USD: "USD",
        GBP: "GBP",
        MAD: "MAD",
        DH: "MAD",
      }
      invoiceData.currency = currencyMap[currencyMatch[0].toUpperCase()] || "USD"
    }

    // Extract items (simplified approach)
    // This is a basic implementation - in a real system, you'd need more sophisticated parsing
    const itemsSection = text.match(/(?:items|description|article|désignation).*?(?:total|subtotal|amount)/is)
    if (itemsSection) {
      const itemLines = itemsSection[0]
        .split("\n")
        .filter((line) => line.match(/\d+(?:[.,]\d+)?/) && !line.match(/(?:total|subtotal|amount|tax|vat)/i))

      itemLines.forEach((line) => {
        // Very simplified parsing - would need refinement for real invoices
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 3) {
          const lastPart = parts[parts.length - 1]
          const secondLastPart = parts[parts.length - 2]
          const amount = Number.parseFloat(lastPart.replace(",", "."))

          if (!isNaN(amount)) {
            const quantity = Number.parseFloat(secondLastPart.replace(",", "."))
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
    ].filter(Boolean).length

    invoiceData.confidence = Math.min(1, extractedFields / 4)

    return invoiceData
  } catch (error) {
    console.error("Error parsing invoice data:", error)
    // Return the basic structure even if parsing fails
    return invoiceData
  }
}

