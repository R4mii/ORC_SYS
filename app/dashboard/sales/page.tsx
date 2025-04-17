"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"
import { Button } from "@/components/ui/button"
import { FileUploadModal } from "@/components/file-upload-modal"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

// Interface for invoice data
interface Invoice {
  id: string
  name: string
  invoiceNumber: string
  partner: string
  invoiceDate: string
  dueDate: string
  createdAt: string
  amount: number
  amountWithTax: number
  type: string
  paymentStatus: string
  declarationStatus: string
  status: string
  hasWarning: boolean
  description?: string
  documentType: string
}

export default function SalesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [currentCompanyName, setCurrentCompanyName] = useState<string | null>(null)

  // Load invoices for the current company
  useEffect(() => {
    // Only run this code in the browser
    if (typeof window === "undefined") return

    // Get the selected company from localStorage
    const companyId = localStorage.getItem("selectedCompanyId")
    if (!companyId) {
      router.push("/auth/login")
      return
    }

    setCurrentCompanyId(companyId)

    // Get company name
    const companies = JSON.parse(localStorage.getItem("companies") || "[]")
    const company = companies.find((c: any) => c.id === companyId)
    if (company) {
      setCurrentCompanyName(company.name)
    }

    // Get purchases documents for this company
    const salesDocuments = localStorage.getItem(`sales_${companyId}`)
    if (salesDocuments) {
      setInvoices(JSON.parse(salesDocuments))
    } else {
      // Initialize with empty array if no invoices exist
      localStorage.setItem(`sales_${companyId}`, JSON.stringify([]))
      setInvoices([])
    }
  }, [router])

  const handleViewInvoice = (id: string) => {
    router.push(`/dashboard/invoices/${id}`)
  }

  const handleUploadComplete = (result: any) => {
    if (!currentCompanyId) return

    // Create a new document from OCR results
    const newDocument = {
      id: Math.random().toString(36).substring(2, 9),
      name: result.invoice.supplier
        ? `Facture ${result.invoice.supplier}`
        : `Document ${new Date().toLocaleDateString()}`,
      description: result.originalFile.name,
      invoiceNumber:
        result.invoice.invoiceNumber ||
        `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
      partner: result.invoice.supplier || "Client inconnu",
      invoiceDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
      dueDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
      createdAt: new Date().toLocaleDateString(),
      amount: result.invoice.amount || 0,
      amountWithTax: result.invoice.amountWithTax || 0,
      vatAmount: result.invoice.vatAmount || 0,
      type: "facture",
      paymentStatus: "non-paye",
      declarationStatus: "non-declare",
      status: "en-cours",
      hasWarning: result.invoice.confidence < 0.7,
      documentType: "sales",
      ocrConfidence: result.invoice.confidence,
      rawText: result.rawText,
    }

    // Get existing documents
    const storageKey = `sales_${currentCompanyId}`
    const existingDocumentsJson = localStorage.getItem(storageKey)
    const existingDocuments = existingDocumentsJson ? JSON.parse(existingDocumentsJson) : []

    // Save to localStorage
    const updatedDocuments = [newDocument, ...existingDocuments]
    localStorage.setItem(storageKey, JSON.stringify(updatedDocuments))

    // Update state
    setInvoices(updatedDocuments)

    // Close the modal
    setUploadModalOpen(false)
  }

  // Calculate total amount
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amountWithTax, 0)

  // Define table columns
  const columns = [
    {
      key: "name",
      header: "Facture",
      cell: (invoice: Invoice) => (
        <div className="font-medium flex items-center gap-2">
          {invoice.hasWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {invoice.name}
        </div>
      ),
      sortable: true,
    },
    {
      key: "invoiceNumber",
      header: "Numéro de facture",
      cell: (invoice: Invoice) => invoice.invoiceNumber,
      sortable: true,
    },
    {
      key: "partner",
      header: "Client",
      cell: (invoice: Invoice) => invoice.partner,
      sortable: true,
    },
    {
      key: "invoiceDate",
      header: "Date de facturation",
      cell: (invoice: Invoice) => invoice.invoiceDate,
      sortable: true,
    },
    {
      key: "dueDate",
      header: "Date d'échéance",
      cell: (invoice: Invoice) => invoice.dueDate,
      sortable: true,
    },
    {
      key: "amount",
      header: "Montant HT",
      cell: (invoice: Invoice) => (
        <div className="text-right">{invoice.amount ? `${invoice.amount.toFixed(2)} DH` : "0,00 DH"}</div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "amountWithTax",
      header: "Montant TTC",
      cell: (invoice: Invoice) => (
        <div className="text-right">{invoice.amountWithTax ? `${invoice.amountWithTax.toFixed(2)} DH` : "0,00 DH"}</div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      cell: (invoice: Invoice) => <StatusTag status="draft" size="sm" />,
      sortable: true,
    },
    {
      key: "paymentStatus",
      header: "État du paiement",
      cell: (invoice: Invoice) => <StatusTag status={invoice.paymentStatus === "paye" ? "paid" : "unpaid"} size="sm" />,
      sortable: true,
    },
    {
      key: "declarationStatus",
      header: "État de Déclaration",
      cell: (invoice: Invoice) => (
        <StatusTag status={invoice.declarationStatus === "declare" ? "declared" : "undeclared"} size="sm" />
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      cell: (invoice: Invoice) => {
        const statusMap: Record<string, any> = {
          "en-cours": "pending",
          brouillon: "draft",
          valide: "validated",
        }
        return <StatusTag status={statusMap[invoice.status] || "pending"} size="sm" />
      },
      sortable: true,
    },
  ]

  const actions = [
    {
      label: "View",
      onClick: (id: string) => {
        router.push(`/dashboard/invoices/${id}`)
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Ventes</CardTitle>
            <CardDescription>Gérez vos factures de vente</CardDescription>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>Charger une facture</Button>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable
            data={invoices}
            columns={columns}
            keyField="id"
            searchable={true}
            searchPlaceholder="Rechercher une facture..."
            pagination={true}
            pageSize={10}
            actions={actions}
            onRowClick={(invoice) => handleViewInvoice(invoice.id)}
          />
        </CardContent>
      </Card>

      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        documentType="sales"
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
