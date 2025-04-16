"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"
import { Button } from "@/components/ui/button"
import { FileUploadModal } from "@/components/file-upload-modal"
import { toast } from "@/hooks/use-toast"

// Interface for bank statement data
interface BankStatement {
  id: string
  account_holder_name: string
  bank_name: string
  account_number: string
  statement_date: string
  previous_balance: number
  new_balance: number
  currency: string
  status: string
  declaration_status: string
  ocr_confidence: number
  created_at: string
  hasWarning?: boolean
}

export default function BankStatementsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatements, setSelectedStatements] = useState<string[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [currentCompanyName, setCurrentCompanyName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load bank statements for the current company
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

    // Fetch bank statements from the database
    fetchBankStatements(companyId)
  }, [router])

  const fetchBankStatements = async (companyId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bank-statements?companyId=${companyId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch bank statements")
      }

      const data = await response.json()

      // Transform data to match the interface
      const formattedData = data.map((item: any) => ({
        id: item.id.toString(),
        account_holder_name: item.account_holder_name || "Unknown",
        bank_name: item.bank_name || "Unknown",
        account_number: item.account_number || "Unknown",
        statement_date: new Date(item.statement_date).toLocaleDateString() || "Unknown",
        previous_balance: Number.parseFloat(item.previous_balance) || 0,
        new_balance: Number.parseFloat(item.new_balance) || 0,
        currency: item.currency || "MAD",
        status: item.status || "draft",
        declaration_status: item.declaration_status || "undeclared",
        ocr_confidence: Number.parseFloat(item.ocr_confidence) || 0,
        created_at: new Date(item.created_at).toLocaleDateString(),
        hasWarning: Number.parseFloat(item.ocr_confidence) < 0.7,
      }))

      setBankStatements(formattedData)
    } catch (error) {
      console.error("Error fetching bank statements:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les relevés bancaires",
        variant: "destructive",
      })

      // Fallback to localStorage if API fails
      const storageKey = `bankStatements_${companyId}`
      const statementsJson = localStorage.getItem(storageKey)
      if (statementsJson) {
        setBankStatements(JSON.parse(statementsJson))
      } else {
        setBankStatements([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewStatement = (id: string) => {
    router.push(`/dashboard/bank-statements/${id}`)
  }

  const handleUploadComplete = async (result: any) => {
    if (!currentCompanyId) return

    try {
      // Create a new bank statement from OCR results
      const bankStatementData = {
        user_id: 1, // Default user ID, should be replaced with actual user ID
        company_id: Number.parseInt(currentCompanyId),
        account_holder_name: result.bankStatement.accountHolderName || "",
        bank_name: result.bankStatement.bankName || "",
        account_number: result.bankStatement.accountNumber || "",
        statement_date: result.bankStatement.statementDate || new Date().toISOString().split("T")[0],
        previous_balance: result.bankStatement.previousBalance || 0,
        new_balance: result.bankStatement.newBalance || 0,
        currency: result.bankStatement.currency || "MAD",
        status: "draft",
        declaration_status: "undeclared",
        ocr_confidence: result.bankStatement.confidence || 0,
        original_filename: result.originalFile.name,
        original_filepath: "", // Would be set by file upload service
        original_mimetype: result.originalFile.type,
        raw_text: result.rawText || "",
        notes: "",
      }

      // Save to database
      const response = await fetch("/api/bank-statements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankStatementData),
      })

      if (!response.ok) {
        throw new Error("Failed to save bank statement to database")
      }

      const savedBankStatement = await response.json()

      toast({
        title: "Relevé bancaire enregistré",
        description: "Le relevé bancaire a été enregistré avec succès",
      })

      // Refresh the list
      fetchBankStatements(currentCompanyId)
    } catch (error) {
      console.error("Error saving bank statement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du relevé bancaire",
        variant: "destructive",
      })
    } finally {
      // Close the modal
      setUploadModalOpen(false)
    }
  }

  const handleDeleteStatement = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce relevé bancaire?")) {
      try {
        const response = await fetch(`/api/bank-statements/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete bank statement")
        }

        toast({
          title: "Relevé supprimé",
          description: "Le relevé bancaire a été supprimé avec succès",
        })

        // Refresh the list
        fetchBankStatements(currentCompanyId!)
      } catch (error) {
        console.error("Error deleting bank statement:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression du relevé bancaire",
          variant: "destructive",
        })
      }
    }
  }

  // Calculate total balance
  const totalBalance = bankStatements.reduce((sum, statement) => sum + statement.new_balance, 0)

  // Define table columns
  const columns = [
    {
      key: "bank_name",
      header: "Banque",
      cell: (statement: BankStatement) => (
        <div className="font-medium flex items-center gap-2">
          {statement.hasWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {statement.bank_name}
        </div>
      ),
      sortable: true,
    },
    {
      key: "account_holder_name",
      header: "Titulaire",
      cell: (statement: BankStatement) => statement.account_holder_name,
      sortable: true,
    },
    {
      key: "account_number",
      header: "Numéro de compte",
      cell: (statement: BankStatement) => statement.account_number,
      sortable: true,
    },
    {
      key: "statement_date",
      header: "Date de relevé",
      cell: (statement: BankStatement) => statement.statement_date,
      sortable: true,
    },
    {
      key: "previous_balance",
      header: "Ancien solde",
      cell: (statement: BankStatement) => (
        <div className="text-right">
          {statement.previous_balance.toFixed(2)} {statement.currency}
        </div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "new_balance",
      header: "Nouveau solde",
      cell: (statement: BankStatement) => (
        <div className="text-right">
          {statement.new_balance.toFixed(2)} {statement.currency}
        </div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      cell: (statement: BankStatement) => {
        const statusMap: Record<string, any> = {
          draft: "draft",
          pending: "pending",
          validated: "validated",
        }
        return <StatusTag status={statusMap[statement.status] || "draft"} size="sm" />
      },
      sortable: true,
    },
    {
      key: "declaration_status",
      header: "État de Déclaration",
      cell: (statement: BankStatement) => (
        <StatusTag status={statement.declaration_status === "declared" ? "declared" : "undeclared"} size="sm" />
      ),
      sortable: true,
    },
  ]

  // Define actions
  const actions = [
    {
      label: "Voir",
      onClick: (statement: BankStatement) => handleViewStatement(statement.id),
    },
    {
      label: "Modifier",
      onClick: (statement: BankStatement) => router.push(`/dashboard/bank-statements/${statement.id}?edit=true`),
    },
    {
      label: "Supprimer",
      onClick: (statement: BankStatement) => handleDeleteStatement(statement.id),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Relevés bancaires {currentCompanyName && `- ${currentCompanyName}`}
        </h1>
        <Button onClick={() => setUploadModalOpen(true)}>Charger un relevé</Button>
      </div>

      <EnhancedDataTable
        data={bankStatements}
        columns={columns}
        keyField="id"
        searchable={true}
        searchPlaceholder="Rechercher un relevé..."
        pagination={true}
        pageSize={10}
        actions={actions}
        onRowClick={(statement) => handleViewStatement(statement.id)}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total des soldes: <strong>{totalBalance.toFixed(2)} MAD</strong>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        documentType="bankStatements"
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
