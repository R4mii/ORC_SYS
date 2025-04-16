"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  X,
  AlertTriangle,
  FileText,
  Check,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function BankStatementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [bankStatement, setBankStatement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("form")

  useEffect(() => {
    if (typeof window === "undefined") return

    const statementId = params.id
    const companyId = localStorage.getItem("selectedCompanyId")

    if (!companyId || !statementId) {
      router.push("/dashboard/bank-statements")
      return
    }

    // Fetch bank statement from API
    fetchBankStatement(statementId as string)
  }, [params.id, router])

  const fetchBankStatement = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bank-statements/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch bank statement")
      }

      const data = await response.json()

      setBankStatement(data)
      setFormData({
        account_holder_name: data.account_holder_name || "",
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        statement_date: data.statement_date ? new Date(data.statement_date).toISOString().split("T")[0] : "",
        previous_balance: Number.parseFloat(data.previous_balance) || 0,
        new_balance: Number.parseFloat(data.new_balance) || 0,
        currency: data.currency || "MAD",
        status: data.status || "draft",
        declaration_status: data.declaration_status || "undeclared",
        notes: data.notes || "",
      })
    } catch (error) {
      console.error("Error fetching bank statement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le relevé bancaire",
        variant: "destructive",
      })

      // Fallback to localStorage
      const companyId = localStorage.getItem("selectedCompanyId") || "default"
      const storageKey = `bankStatements_${companyId}`
      const statementsJson = localStorage.getItem(storageKey)

      if (statementsJson) {
        const statements = JSON.parse(statementsJson)
        const foundStatement = statements.find((stmt: any) => stmt.id === id)

        if (foundStatement) {
          setBankStatement(foundStatement)
          setFormData({
            account_holder_name: foundStatement.account_holder_name || "",
            bank_name: foundStatement.bank_name || "",
            account_number: foundStatement.account_number || "",
            statement_date: foundStatement.statement_date || "",
            previous_balance: foundStatement.previous_balance || 0,
            new_balance: foundStatement.new_balance || 0,
            currency: foundStatement.currency || "MAD",
            status: foundStatement.status || "draft",
            declaration_status: foundStatement.declaration_status || "undeclared",
            notes: foundStatement.notes || "",
          })
        } else {
          router.push("/dashboard/bank-statements")
        }
      } else {
        router.push("/dashboard/bank-statements")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleSave = async () => {
    if (!bankStatement) return

    try {
      const response = await fetch(`/api/bank-statements/${bankStatement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update bank statement")
      }

      const updatedStatement = await response.json()

      setBankStatement(updatedStatement)
      setEditMode(false)

      toast({
        title: "Relevé mis à jour",
        description: "Le relevé bancaire a été mis à jour avec succès",
      })
    } catch (error) {
      console.error("Error updating bank statement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du relevé bancaire",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    // Reset form data to original bank statement data
    if (bankStatement) {
      setFormData({
        account_holder_name: bankStatement.account_holder_name || "",
        bank_name: bankStatement.bank_name || "",
        account_number: bankStatement.account_number || "",
        statement_date: bankStatement.statement_date
          ? new Date(bankStatement.statement_date).toISOString().split("T")[0]
          : "",
        previous_balance: Number.parseFloat(bankStatement.previous_balance) || 0,
        new_balance: Number.parseFloat(bankStatement.new_balance) || 0,
        currency: bankStatement.currency || "MAD",
        status: bankStatement.status || "draft",
        declaration_status: bankStatement.declaration_status || "undeclared",
        notes: bankStatement.notes || "",
      })
    }
    setEditMode(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }

  if (!bankStatement) {
    return <div className="flex items-center justify-center h-screen">Relevé bancaire non trouvé</div>
  }

  const hasWarning = (Number.parseFloat(bankStatement.ocr_confidence) || 0) < 0.7

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/bank-statements")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            <h1 className="text-lg font-medium">Relevés bancaires</h1>
          </div>
          <div className="text-sm text-muted-foreground ml-2">
            {bankStatement.bank_name} - {bankStatement.account_number}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
            <FileText className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">ID: {bankStatement.id}</span>
          </div>
          <div className="text-sm">Date: {new Date(bankStatement.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2 p-4 border-b">
        {editMode ? (
          <>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-2" />
              Valider
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Abandonner
            </Button>
          </>
        ) : (
          <>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditMode(true)}>
              Modifier
            </Button>
            <Button variant="outline">Valider</Button>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
              Abandonner
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center">
          <span className="text-sm text-muted-foreground mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {bankStatement.status === "draft"
              ? "Brouillon"
              : bankStatement.status === "pending"
                ? "En attente"
                : "Validé"}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentPage}/{totalPages}
          </span>
          <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Warning message */}
      {hasWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 mx-4 mt-4 rounded-md">
          <AlertTriangle className="h-4 w-4 inline-block mr-2" />
          La confiance OCR pour ce relevé est faible. Veuillez vérifier les informations.
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-1/2 overflow-y-auto p-4 border-r">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Informations</TabsTrigger>
              <TabsTrigger value="ocr">Texte OCR</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "form" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du titulaire</label>
                  {editMode ? (
                    <Input
                      value={formData.account_holder_name}
                      onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{bankStatement.account_holder_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Banque</label>
                  {editMode ? (
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange("bank_name", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{bankStatement.bank_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Numéro de compte</label>
                  {editMode ? (
                    <Input
                      value={formData.account_number}
                      onChange={(e) => handleInputChange("account_number", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">{bankStatement.account_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de relevé</label>
                  {editMode ? (
                    <Input
                      type="date"
                      value={formData.statement_date}
                      onChange={(e) => handleInputChange("statement_date", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm">
                      {bankStatement.statement_date
                        ? new Date(bankStatement.statement_date).toLocaleDateString()
                        : "Non spécifié"}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ancien solde</label>
                  {editMode ? (
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.previous_balance}
                        onChange={(e) => handleInputChange("previous_balance", Number.parseFloat(e.target.value))}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-2 text-muted-foreground text-sm">{formData.currency}</span>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {Number.parseFloat(bankStatement.previous_balance).toFixed(2)} {bankStatement.currency}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau solde</label>
                  {editMode ? (
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.new_balance}
                        onChange={(e) => handleInputChange("new_balance", Number.parseFloat(e.target.value))}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-2 text-muted-foreground text-sm">{formData.currency}</span>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {Number.parseFloat(bankStatement.new_balance).toFixed(2)} {bankStatement.currency}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Devise</label>
                  {editMode ? (
                    <Input value={formData.currency} onChange={(e) => handleInputChange("currency", e.target.value)} />
                  ) : (
                    <p className="text-sm">{bankStatement.currency}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  {editMode ? (
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="pending">En attente</option>
                      <option value="validated">Validé</option>
                    </select>
                  ) : (
                    <p className="text-sm">
                      <Badge variant="outline" className="font-normal">
                        {bankStatement.status === "draft"
                          ? "Brouillon"
                          : bankStatement.status === "pending"
                            ? "En attente"
                            : "Validé"}
                      </Badge>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">État de déclaration</label>
                  {editMode ? (
                    <select
                      value={formData.declaration_status}
                      onChange={(e) => handleInputChange("declaration_status", e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="undeclared">Non déclaré</option>
                      <option value="declared">Déclaré</option>
                    </select>
                  ) : (
                    <p className="text-sm">
                      <Badge variant="outline" className="font-normal">
                        {bankStatement.declaration_status === "declared" ? "Déclaré" : "Non déclaré"}
                      </Badge>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  {editMode ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="w-full p-2 border rounded-md min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm">{bankStatement.notes || "Aucune note"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ocr" && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Texte extrait par OCR</h3>
                <div className="max-h-[500px] overflow-y-auto text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                  {bankStatement.raw_text || "Aucun texte OCR disponible pour ce document"}
                </div>
              </div>

              {bankStatement.ocr_confidence && (
                <div className="flex items-center space-x-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${Number.parseFloat(bankStatement.ocr_confidence) > 0.7 ? "bg-green-500" : Number.parseFloat(bankStatement.ocr_confidence) > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                  ></div>
                  <span>
                    Confiance OCR: {Math.round(Number.parseFloat(bankStatement.ocr_confidence) * 100)}%
                    {Number.parseFloat(bankStatement.ocr_confidence) > 0.7
                      ? " (Élevée)"
                      : Number.parseFloat(bankStatement.ocr_confidence) > 0.4
                        ? " (Moyenne)"
                        : " (Faible)"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel - Document viewer */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{zoomLevel}%</span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                {bankStatement.original_filepath ? (
                  <div
                    className="bg-white shadow-md max-h-full"
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "center",
                      transition: "transform 0.2s",
                    }}
                  >
                    {bankStatement.original_filepath.endsWith(".pdf") ? (
                      <iframe
                        src={bankStatement.original_filepath + "#toolbar=0&navpanes=0"}
                        title="Bank Statement PDF"
                        className="w-[600px] h-[calc(100vh-200px)]"
                        style={{ border: "none" }}
                      />
                    ) : (
                      <img
                        src={bankStatement.original_filepath || "/placeholder.svg"}
                        alt="Bank statement document"
                        className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=800&width=600"
                          console.error("Error loading image:", bankStatement.original_filepath)
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucun document disponible</p>
                    <p className="text-sm mt-2">Le document original n'est pas disponible pour ce relevé bancaire.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
