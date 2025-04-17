"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"
import { Button } from "@/components/ui/button"

// Interface for bank statement data
interface BankStatement {
  id: string
  accountHolderName: string
  bankName: string
  accountNumber: string
  statementDate: string
  previousBalance: number
  newBalance: number
  currency: string
  status: string
  hasWarning: boolean
  description?: string
  documentType: string
}

export default function BankStatementsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBankStatements, setSelectedBankStatements] = useState<string[]>([])
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [currentCompanyName, setCurrentCompanyName] = useState<string | null>(null)

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

    // Get bank statement documents for this company
    const bankStatementDocuments = localStorage.getItem(`bankStatements_${companyId}`)
    if (bankStatementDocuments) {
      setBankStatements(JSON.parse(bankStatementDocuments))
    } else {
      // Initialize with empty array if no bank statements exist
      localStorage.setItem(`bankStatements_${companyId}`, JSON.stringify([]))
      setBankStatements([])
    }
  }, [router])

  const handleViewBankStatement = (id: string) => {
    //   router.push(`/dashboard/bank-statements/${id}`)
    alert(`View bank statement with ID: ${id}`) // Placeholder
  }

  // Define table columns
  const columns = [
    {
      key: "accountHolderName",
      header: "Nom du titulaire du compte",
      cell: (bankStatement: BankStatement) => (
        <div className="font-medium flex items-center gap-2">
          {bankStatement.hasWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          {bankStatement.accountHolderName}
        </div>
      ),
      sortable: true,
    },
    {
      key: "bankName",
      header: "Banque",
      cell: (bankStatement: BankStatement) => bankStatement.bankName,
      sortable: true,
    },
    {
      key: "accountNumber",
      header: "Numéro de compte",
      cell: (bankStatement: BankStatement) => bankStatement.accountNumber,
      sortable: true,
    },
    {
      key: "statementDate",
      header: "Date de relevé",
      cell: (bankStatement: BankStatement) => bankStatement.statementDate,
      sortable: true,
    },
    {
      key: "previousBalance",
      header: "Ancien solde",
      cell: (bankStatement: BankStatement) => (
        <div className="text-right">
          {bankStatement.previousBalance ? `${bankStatement.previousBalance.toFixed(2)} DH` : "0,00 DH"}
        </div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "newBalance",
      header: "Nouveau solde",
      cell: (bankStatement: BankStatement) => (
        <div className="text-right">
          {bankStatement.newBalance ? `${bankStatement.newBalance.toFixed(2)} DH` : "0,00 DH"}
        </div>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "status",
      header: "Statut",
      cell: (bankStatement: BankStatement) => {
        const statusMap: Record<string, any> = {
          "en-cours": "pending",
          brouillon: "draft",
          valide: "validated",
        }
        return <StatusTag status={statusMap[bankStatement.status] || "pending"} size="sm" />
      },
      sortable: true,
    },
  ]

  // Define actions
  const actions = [
    {
      label: "Voir",
      onClick: (bankStatement: BankStatement) => handleViewBankStatement(bankStatement.id),
    },
    {
      label: "Modifier",
      onClick: (bankStatement: BankStatement) => alert(`Edit bank statement with ID: ${bankStatement.id}`), // Placeholder
    },
    {
      label: "Supprimer",
      onClick: (bankStatement: BankStatement) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce relevé bancaire?")) {
          const updatedBankStatements = bankStatements.filter((inv) => inv.id !== bankStatement.id)
          setBankStatements(updatedBankStatements)
          localStorage.setItem(`bankStatements_${currentCompanyId}`, JSON.stringify(updatedBankStatements))
        }
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Relevés bancaires {currentCompanyName && `- ${currentCompanyName}`}
        </h1>
        <Button onClick={() => alert("Implement upload functionality")}>
          {/*  Replace alert() with the correct function to show the upload modal */}
          Charger un relevé
        </Button>
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
        onRowClick={(bankStatement) => handleViewBankStatement(bankStatement.id)}
      />
    </div>
  )
}
