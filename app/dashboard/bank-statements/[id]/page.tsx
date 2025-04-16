"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  FileText,
  Save,
  Edit,
  X,
  Building2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  ocr_confidence?: number
  raw_text?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export default function BankStatementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [statement, setStatement] = useState<BankStatement | null>(null)
  const [editedStatement, setEditedStatement] = useState<BankStatement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // Check if edit mode is requested via URL
    if (searchParams.get("edit") === "true") {
      setIsEditing(true)
    }

    fetchBankStatement()
  }, [params.id, searchParams])

  const fetchBankStatement = async () => {
    setIsLoading(true)
    try {
      // Fetch from API
      const response = await fetch(`/api/bank-statements/${params.id}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setStatement(data)
      setEditedStatement(data)
    } catch (error) {
      console.error("Error fetching bank statement:", error)
      toast({
        title: "Error",
        description: "Failed to load bank statement from database. Falling back to local data.",
        variant: "destructive",
      })

      // Fallback to localStorage
      const companyId = localStorage.getItem("selectedCompanyId")
      if (companyId) {
        const statementsJson = localStorage.getItem(`bankStatements_${companyId}`)
        if (statementsJson) {
          const statements = JSON.parse(statementsJson)
          const foundStatement = statements.find((s: any) => s.id === params.id)
          if (foundStatement) {
            setStatement(foundStatement)
            setEditedStatement(foundStatement)
          } else {
            toast({
              title: "Not Found",
              description: "Bank statement not found",
              variant: "destructive",
            })
            router.push("/dashboard/bank-statements")
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedStatement) return

    try {
      // Update via API
      const response = await fetch(`/api/bank-statements/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedStatement),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const updatedStatement = await response.json()
      setStatement(updatedStatement)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Bank statement updated successfully",
      })
    } catch (error) {
      console.error("Error updating bank statement:", error)
      toast({
        title: "Error",
        description: "Failed to update bank statement in database. Updating locally instead.",
        variant: "destructive",
      })

      // Fallback to localStorage
      const companyId = localStorage.getItem("selectedCompanyId")
      if (companyId) {
        const statementsJson = localStorage.getItem(`bankStatements_${companyId}`)
        if (statementsJson) {
          const statements = JSON.parse(statementsJson)
          const updatedStatements = statements.map((s: any) => (s.id === editedStatement.id ? editedStatement : s))
          localStorage.setItem(`bankStatements_${companyId}`, JSON.stringify(updatedStatements))
          setStatement(editedStatement)
          setIsEditing(false)
        }
      }
    }
  }

  const handleCancel = () => {
    setEditedStatement(statement)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editedStatement) return

    setEditedStatement({
      ...editedStatement,
      [field]: value,
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading...</div>
  }

  if (!statement) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Bank Statement Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested bank statement could not be found.</p>
        <Button onClick={() => router.push("/dashboard/bank-statements")}>Back to Bank Statements</Button>
      </div>
    )
  }

  const balanceDifference = statement.new_balance - statement.previous_balance
  const isPositive = balanceDifference >= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/bank-statements")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Bank Statement Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              Bank Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              {isEditing ? (
                <Input
                  value={editedStatement?.bank_name || ""}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                />
              ) : (
                <p className="text-sm">{statement.bank_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Holder</label>
              {isEditing ? (
                <Input
                  value={editedStatement?.account_holder_name || ""}
                  onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
                />
              ) : (
                <p className="text-sm">{statement.account_holder_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              {isEditing ? (
                <Input
                  value={editedStatement?.account_number || ""}
                  onChange={(e) => handleInputChange("account_number", e.target.value)}
                />
              ) : (
                <p className="text-sm">{statement.account_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statement Date</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={
                    editedStatement?.statement_date
                      ? new Date(editedStatement.statement_date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleInputChange("statement_date", e.target.value)}
                />
              ) : (
                <p className="text-sm">{formatDate(statement.statement_date)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-primary" />
              Balance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Previous Balance</label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editedStatement?.previous_balance || 0}
                  onChange={(e) => handleInputChange("previous_balance", Number.parseFloat(e.target.value))}
                />
              ) : (
                <p className="text-sm font-medium">
                  {statement.previous_balance.toFixed(2)} {statement.currency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Balance</label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editedStatement?.new_balance || 0}
                  onChange={(e) => handleInputChange("new_balance", Number.parseFloat(e.target.value))}
                />
              ) : (
                <p className="text-sm font-medium">
                  {statement.new_balance.toFixed(2)} {statement.currency}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              {isEditing ? (
                <Input
                  value={editedStatement?.currency || ""}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                />
              ) : (
                <p className="text-sm">{statement.currency}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Balance Difference</label>
              <div className="flex items-center">
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {Math.abs(balanceDifference).toFixed(2)} {statement.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              Status Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              {isEditing ? (
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={editedStatement?.status || ""}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="validated">Validated</option>
                </select>
              ) : (
                <p className="text-sm">
                  <Badge
                    variant="outline"
                    className={
                      statement.status === "validated"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : statement.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {statement.status === "validated"
                      ? "Validated"
                      : statement.status === "pending"
                        ? "Pending"
                        : "Draft"}
                  </Badge>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Declaration Status</label>
              {isEditing ? (
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={editedStatement?.declaration_status || ""}
                  onChange={(e) => handleInputChange("declaration_status", e.target.value)}
                >
                  <option value="undeclared">Undeclared</option>
                  <option value="declared">Declared</option>
                </select>
              ) : (
                <p className="text-sm">
                  <Badge
                    variant="outline"
                    className={
                      statement.declaration_status === "declared"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {statement.declaration_status === "declared" ? "Declared" : "Undeclared"}
                  </Badge>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Created At</label>
              <p className="text-sm">{formatDate(statement.created_at)}</p>
            </div>

            {statement.updated_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm">{formatDate(statement.updated_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Notes</TabsTrigger>
          <TabsTrigger value="ocr">OCR Text</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background"
                  value={editedStatement?.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add notes about this bank statement..."
                />
              ) : (
                <div className="p-3 min-h-[200px] rounded-md border bg-muted/20">
                  {statement.notes || "No notes available for this bank statement."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                OCR Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 min-h-[200px] rounded-md border bg-muted/20 whitespace-pre-wrap overflow-auto max-h-[400px]">
                {statement.raw_text || "No OCR text available for this bank statement."}
              </div>

              {statement.ocr_confidence !== undefined && (
                <div className="mt-4 flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      statement.ocr_confidence > 0.7
                        ? "bg-green-500"
                        : statement.ocr_confidence > 0.4
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    OCR Confidence: {Math.round(statement.ocr_confidence * 100)}%
                    {statement.ocr_confidence > 0.7
                      ? " (High)"
                      : statement.ocr_confidence > 0.4
                        ? " (Medium)"
                        : " (Low)"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
