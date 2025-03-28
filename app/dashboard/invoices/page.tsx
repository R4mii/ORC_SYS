"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"
import { Button } from "@/components/ui/button"
import { FileUploadModal } from "@/components/file-upload-modal"

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

export default function InvoicesPage() {
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
    const purchasesDocuments = localStorage.getItem(`purchases_${companyId}`)
    if (purchasesDocuments) {
      setInvoices(JSON.parse(purchasesDocuments))
    } else {
      // Initialize with empty array if no invoices exist
      localStorage.setItem(`purchases_${companyId}`, JSON.stringify([]))
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
      partner: result.invoice.supplier || "Fournisseur inconnu",
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
      documentType: "purchases",
      ocrConfidence: result.invoice.confidence,
      rawText: result.rawText,
    }

    // Get existing documents
    const storageKey = `purchases_${currentCompanyId}`
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
      header: "Partenaire",
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

  // Define actions
  const actions = [
    {
      label: "Voir",
      onClick: (invoice: Invoice) => handleViewInvoice(invoice.id),
    },
    {
      label: "Modifier",
      onClick: (invoice: Invoice) => router.push(`/dashboard/invoices/${invoice.id}?edit=true`),
    },
    {
      label: "Supprimer",
      onClick: (invoice: Invoice) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette facture?")) {
          const updatedInvoices = invoices.filter((inv) => inv.id !== invoice.id)
          setInvoices(updatedInvoices)
          localStorage.setItem(`purchases_${currentCompanyId}`, JSON.stringify(updatedInvoices))
        }
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Achats {currentCompanyName && `- ${currentCompanyName}`}</h1>
        <Button onClick={() => setUploadModalOpen(true)}>Charger une facture</Button>
      </div>

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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <strong>{totalAmount.toFixed(2)} DH</strong>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        documentType="purchases"
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}

