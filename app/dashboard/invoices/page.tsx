"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
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
    </div>
  )
}

