"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download, Plus } from "lucide-react"
import { UploadModal } from "@/components/upload-modal"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"

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

    // Get invoices for this company
    const companyInvoices = localStorage.getItem(`invoices_${companyId}`)
    if (companyInvoices) {
      setInvoices(JSON.parse(companyInvoices))
    } else {
      // Initialize with empty array if no invoices exist
      localStorage.setItem(`invoices_${companyId}`, JSON.stringify([]))
      setInvoices([])
    }
  }, [router])

  const handleUpload = (files: File[]) => {
    if (!currentCompanyId) return

    // Create new invoice objects with better descriptions instead of filenames
    const newInvoices = files.map((file) => {
      // Generate a more descriptive name based on the file
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
      const isInvoice = fileExtension === "pdf" || fileExtension === "jpg" || fileExtension === "png"

      // Generate a random invoice number
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      // Generate a random supplier name
      const suppliers = ["HITECK LAND", "WANA CORPORATE", "MAROC TELECOM", "INWI", "ORANGE MAROC", "BMCE BANK"]
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]

      // Generate a random date within the last 30 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`

      // Generate a random amount
      const amount = Math.floor(Math.random() * 10000) + 100

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: isInvoice ? `Facture ${randomSupplier}` : file.name,
        description: file.name, // Keep original filename as description
        invoiceNumber: invoiceNumber,
        partner: randomSupplier,
        invoiceDate: formattedDate,
        dueDate: formattedDate,
        createdAt: new Date().toLocaleDateString(),
        amount: amount,
        amountWithTax: Math.round(amount * 1.2),
        type: "facture",
        paymentStatus: "non-paye",
        declarationStatus: "non-declare",
        status: "en-cours",
        hasWarning: true,
      }
    })

    // Update invoices state
    const updatedInvoices = [...newInvoices, ...invoices]
    setInvoices(updatedInvoices)

    // Save to localStorage for this company
    localStorage.setItem(`invoices_${currentCompanyId}`, JSON.stringify(updatedInvoices))

    setUploadModalOpen(false)
  }

  const handleViewInvoice = (id: string) => {
    router.push(`/dashboard/invoices/${id}`)
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
          localStorage.setItem(`invoices_${currentCompanyId}`, JSON.stringify(updatedInvoices))
        }
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Achats {currentCompanyName && `- ${currentCompanyName}`}</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Créer
          </Button>
          <Button size="sm" variant="outline" onClick={() => setUploadModalOpen(true)}>
            <Download className="h-4 w-4 mr-1" />
            Charger
          </Button>
        </div>
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

      {/* Upload Modal */}
      <UploadModal
        title="Achats"
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAccept={handleUpload}
      />
    </div>
  )
}

