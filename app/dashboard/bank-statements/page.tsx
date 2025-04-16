"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { StatusTag } from "@/components/status-tag"
import { Button } from "@/components/ui/button"
import { FileUploadModal } from "@/components/file-upload-modal"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

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
  created_at: string
}

export default function BankStatementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [statements, setStatements] = useState<BankStatement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [currentCompanyName, setCurrentCompanyName] = useState<string | null>(null)

  // Load bank statements
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

    fetchBankStatements(companyId)
  }, [router])

  const fetchBankStatements = async (companyId: string) => {
    setIsLoading(true)
    try {
      // Fetch from API
      const response = await fetch(`/api/bank-statements?companyId=${companyId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setStatements(data.data || [])
    } catch (error) {
      console.error("Error fetching bank statements:", error)
      toast({
        title: "Error",
        description: "Failed to load bank statements from database. Falling back to local data.",
        variant: "destructive",
      })

      // Fallback to localStorage
      const statementsJson = localStorage.getItem(`bankStatements_${companyId}`)
      if (statementsJson) {
        setStatements(JSON.parse(statementsJson))
      } else {
        setStatements([])
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
      const newStatement = {
        company_id: Number.parseInt(currentCompanyId),
        account_holder_name: result.bankStatement.accountHolderName || "Unknown",
        bank_name: result.bankStatement.bankName || "Unknown Bank",
        account_number: result.bankStatement.accountNumber || "",
        statement_date: result.bankStatement.statementDate || new Date().toISOString().split("T")[0],
        previous_balance: result.bankStatement.previousBalance || 0,
        new_balance: result.bankStatement.newBalance || 0,
        currency: result.bankStatement.currency || "MAD",
        status: "draft",
        declaration_status: "undeclared",
        ocr_confidence: result.bankStatement.confidence || 0,
        original_filename: result.originalFile.name,
        original_mimetype: result.originalFile.type,
        raw_text: result.rawText || "",
      }

      // Save to database via API
      const response = await fetch("/api/bank-statements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStatement),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const savedStatement = await response.json()

      // Update the local state
      setStatements((prev) => [savedStatement, ...prev])

      toast({
        title: "Success",
        description: "Bank statement uploaded and saved to database",
      })
    } catch (error) {
      console.error("Error saving bank statement:", error)
      toast({
        title: "Error",
        description: "Failed to save to database. Saving locally instead.",
        variant: "destructive",
      })

      // Fallback to localStorage
      const newStatement = {
        id: Math.random().toString(36).substring(2, 9),
        account_holder_name: result.bankStatement.accountHolderName || "Unknown",
        bank_name: result.bankStatement.bankName || "Unknown Bank",
        account_number: result.bankStatement.accountNumber || "",
        statement_date: result.bankStatement.statementDate || new Date().toISOString().split("T")[0],
        previous_balance: result.bankStatement.previousBalance || 0,
        new_balance: result.bankStatement.newBalance || 0,
        currency: result.bankStatement.currency || "MAD",
        status: "draft",
        declaration_status: "undeclared",
        created_at: new Date().toISOString(),
      }

      // Get existing statements
      const statementsJson = localStorage.getItem(`bankStatements_${currentCompanyId}`)
      const existingStatements = statementsJson ? JSON.parse(statementsJson) : []

      // Save to localStorage
      const updatedStatements = [newStatement, ...existingStatements]
      localStorage.setItem(`bankStatements_${currentCompanyId}`, JSON.stringify(updatedStatements))

      // Update state
      setStatements(updatedStatements)
    }

    // Close the modal
    setUploadModalOpen(false)
  }

  // Define table columns
  const columns = [
    {
      key: "bank_name",
      header: "Bank",
      cell: (statement: BankStatement) => <div className="font-medium">{statement.bank_name}</div>,
      sortable: true,
    },
    {
      key: "account_holder_name",
      header: "Account Holder",
      cell: (statement: BankStatement) => statement.account_holder_name,
      sortable: true,
    },
    {
      key: "account_number",
      header: "Account Number",
      cell: (statement: BankStatement) => statement.account_number,
      sortable: true,
    },
    {
      key: "statement_date",
      header: "Date",
      cell: (statement: BankStatement) => formatDate(statement.statement_date),
      sortable: true,
    },
    {
      key: "previous_balance",
      header: "Previous Balance",
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
      header: "New Balance",
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
      header: "Status",
      cell: (statement: BankStatement) => (
        <StatusTag
          status={statement.status === "draft" ? "draft" : statement.status === "validated" ? "validated" : "pending"}
          size="sm"
        />
      ),
      sortable: true,
    },
    {
      key: "declaration_status",
      header: "Declaration",
      cell: (statement: BankStatement) => (
        <StatusTag status={statement.declaration_status === "declared" ? "declared" : "undeclared"} size="sm" />
      ),
      sortable: true,
    },
  ]

  // Define actions
  const actions = [
    {
      label: "View",
      onClick: (statement: BankStatement) => handleViewStatement(statement.id),
    },
    {
      label: "Edit",
      onClick: (statement: BankStatement) => router.push(`/dashboard/bank-statements/${statement.id}?edit=true`),
    },
    {
      label: "Delete",
      onClick: async (statement: BankStatement) => {
        if (confirm("Are you sure you want to delete this bank statement?")) {
          try {
            // Delete from API
            const response = await fetch(`/api/bank-statements/${statement.id}`, {
              method: "DELETE",
            })

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`)
            }

            // Update state
            setStatements((prev) => prev.filter((s) => s.id !== statement.id))

            toast({
              title: "Success",
              description: "Bank statement deleted successfully",
            })
          } catch (error) {
            console.error("Error deleting bank statement:", error)
            toast({
              title: "Error",
              description: "Failed to delete bank statement",
              variant: "destructive",
            })
          }
        }
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Bank Statements {currentCompanyName && `- ${currentCompanyName}`}
        </h1>
        <Button onClick={() => setUploadModalOpen(true)}>Upload Bank Statement</Button>
      </div>

      <EnhancedDataTable
        data={statements}
        columns={columns}
        keyField="id"
        searchable={true}
        searchPlaceholder="Search bank statements..."
        pagination={true}
        pageSize={10}
        actions={actions}
        onRowClick={(statement) => handleViewStatement(statement.id)}
        isLoading={isLoading}
      />

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
