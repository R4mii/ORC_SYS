"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Printer,
  Download,
  Edit,
  Check,
  X,
  FileText,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("form")
  const [showAccountingEntries, setShowAccountingEntries] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const invoiceId = params.id
    const companyId = localStorage.getItem("selectedCompanyId")

    if (!companyId || !invoiceId) {
      router.push("/dashboard/invoices")
      return
    }

    // Get invoice data from localStorage
    const purchasesDocuments = localStorage.getItem(`purchases_${companyId}`)
    if (purchasesDocuments) {
      const invoices = JSON.parse(purchasesDocuments)
      const foundInvoice = invoices.find((inv: any) => inv.id === invoiceId)

      if (foundInvoice) {
        setInvoice(foundInvoice)
        setFormData({
          supplier: foundInvoice.partner || "",
          accountCode: foundInvoice.accountCode || '61110000 Achats de marchandises "groupe A"',
          currency: foundInvoice.currency || "MAD",
          invoiceNumber: foundInvoice.invoiceNumber || "",
          invoiceDate: foundInvoice.invoiceDate || "",
          withholding: foundInvoice.withholding || false,
          prorataTVA: foundInvoice.prorataTVA || true,
          amountHT: foundInvoice.amount || 0,
          amountTVA: foundInvoice.vatAmount || 0,
          stampDuty: foundInvoice.stampDuty || 0,
          expenses: foundInvoice.expenses || 0,
          amountTTC: foundInvoice.amountWithTax || 0,
          nonRecoverableTVA: foundInvoice.nonRecoverableTVA || false,
          multipleTVAAmounts: foundInvoice.multipleTVAAmounts || false,
          details: foundInvoice.details || "",
          companyName: foundInvoice.companyName || "",
          address: foundInvoice.address || "",
        })
      } else {
        router.push("/dashboard/invoices")
      }
    }

    setLoading(false)
  }, [params.id, router])

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

  const handleSave = () => {
    if (!invoice || typeof window === "undefined") return

    const companyId = localStorage.getItem("selectedCompanyId")
    if (!companyId) return

    // Update invoice with form data
    const updatedInvoice = {
      ...invoice,
      partner: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: formData.invoiceDate,
      amount: Number.parseFloat(formData.amountHT),
      vatAmount: Number.parseFloat(formData.amountTVA),
      amountWithTax: Number.parseFloat(formData.amountTTC),
    }

    // Update in localStorage
    const purchasesDocuments = localStorage.getItem(`purchases_${companyId}`)
    if (purchasesDocuments) {
      const invoices = JSON.parse(purchasesDocuments)
      const updatedInvoices = invoices.map((inv: any) => (inv.id === invoice.id ? updatedInvoice : inv))

      localStorage.setItem(`purchases_${companyId}`, JSON.stringify(updatedInvoices))

      // Redirect to invoices page
      router.push("/dashboard/invoices")
    }
  }

  const handleCancel = () => {
    // Reset form data to original invoice data
    if (invoice) {
      setFormData({
        supplier: invoice.partner || "",
        accountCode: '61110000 Achats de marchandises "groupe A"',
        currency: "MAD",
        invoiceNumber: invoice.invoiceNumber || "",
        invoiceDate: invoice.invoiceDate || "",
        withholding: false,
        prorataTVA: true,
        amountHT: invoice.amount || 0,
        amountTVA: invoice.vatAmount || 0,
        stampDuty: 0,
        expenses: 0,
        amountTTC: invoice.amountWithTax || 0,
        nonRecoverableTVA: false,
        multipleTVAAmounts: false,
      })
    }
    setEditMode(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }

  if (!invoice) {
    return <div className="flex items-center justify-center h-screen">Facture non trouvée</div>
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/invoices")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Menu className="h-5 w-5 mr-2" />
            <h1 className="text-lg font-medium">Achats</h1>
          </div>
          <div className="text-sm text-muted-foreground ml-2">{invoice.description || invoice.name}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
            <FileText className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">05 20 25 07 07</span>
          </div>
          <div className="text-sm">EXPERIO TUTO</div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">B</div>
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
            Brouillon
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
      {invoice.hasWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 mx-4 mt-4 rounded-md">
          La date de cette facture ne correspond pas à l'exercice fiscal courant
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-1/2 overflow-y-auto p-4 border-r">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {invoice.companyName && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'entreprise</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              )}

              {invoice.address && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Fournisseur</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Compte de charge</label>
                <Input
                  value={formData.accountCode}
                  onChange={(e) => handleInputChange("accountCode", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Devise</label>
                <Input
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Numéro de facture</label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date de facturation</label>
                <Input
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="withholding"
                  checked={formData.withholding}
                  onCheckedChange={(checked) => handleInputChange("withholding", checked)}
                  disabled={!editMode}
                />
                <label htmlFor="withholding" className="text-sm font-medium">
                  Retenue à la source
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prorataTVA"
                  checked={formData.prorataTVA}
                  onCheckedChange={(checked) => handleInputChange("prorataTVA", checked)}
                  disabled={!editMode}
                />
                <label htmlFor="prorataTVA" className="text-sm font-medium">
                  Prorata de TVA
                </label>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Montant HT</label>
                <div className="flex items-center">
                  <Input
                    value={formData.amountHT}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value) || 0
                      handleInputChange("amountHT", value)
                      // Recalculate TTC
                      const ttc =
                        value + (formData.amountTVA || 0) + (formData.stampDuty || 0) + (formData.expenses || 0)
                      handleInputChange("amountTTC", ttc)
                    }}
                    disabled={!editMode}
                    type="number"
                    className="text-right"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">{formData.currency || "DH"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Montant TVA</label>
                <div className="flex items-center">
                  <Input
                    value={formData.amountTVA}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value) || 0
                      handleInputChange("amountTVA", value)
                      // Recalculate TTC
                      const ttc =
                        (formData.amountHT || 0) + value + (formData.stampDuty || 0) + (formData.expenses || 0)
                      handleInputChange("amountTTC", ttc)
                    }}
                    disabled={!editMode}
                    type="number"
                    className="text-right"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">{formData.currency || "DH"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Droits de timbre</label>
                <div className="flex items-center">
                  <Input
                    value={formData.stampDuty}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value) || 0
                      handleInputChange("stampDuty", value)
                      // Recalculate TTC
                      const ttc =
                        (formData.amountHT || 0) + (formData.amountTVA || 0) + value + (formData.expenses || 0)
                      handleInputChange("amountTTC", ttc)
                    }}
                    disabled={!editMode}
                    type="number"
                    className="text-right"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">{formData.currency || "DH"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Débours</label>
                <div className="flex items-center">
                  <Input
                    value={formData.expenses}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value) || 0
                      handleInputChange("expenses", value)
                      // Recalculate TTC
                      const ttc =
                        (formData.amountHT || 0) + (formData.amountTVA || 0) + (formData.stampDuty || 0) + value
                      handleInputChange("amountTTC", ttc)
                    }}
                    disabled={!editMode}
                    type="number"
                    className="text-right"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">{formData.currency || "DH"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Montant TTC</label>
                <div className="flex items-center">
                  <Input
                    value={formData.amountTTC}
                    onChange={(e) => handleInputChange("amountTTC", Number.parseFloat(e.target.value) || 0)}
                    disabled={!editMode}
                    type="number"
                    className="text-right"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">{formData.currency || "DH"}</span>
                </div>
              </div>

              {invoice.details && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Détails de la facture</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => handleInputChange("details", e.target.value)}
                    disabled={!editMode}
                    className="w-full min-h-[100px] p-2 border rounded-md"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nonRecoverableTVA"
                  checked={formData.nonRecoverableTVA}
                  onCheckedChange={(checked) => handleInputChange("nonRecoverableTVA", checked)}
                  disabled={!editMode}
                />
                <label htmlFor="nonRecoverableTVA" className="text-sm font-medium">
                  TVA non Récupérable
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multipleTVAAmounts"
                  checked={formData.multipleTVAAmounts}
                  onCheckedChange={(checked) => handleInputChange("multipleTVAAmounts", checked)}
                  disabled={!editMode}
                />
                <label htmlFor="multipleTVAAmounts" className="text-sm font-medium">
                  Plusieurs montants de TVA
                </label>
              </div>

              {/* Add Écritures button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-32"
                  onClick={() => setShowAccountingEntries(!showAccountingEntries)}
                >
                  Écritures
                </Button>
              </div>

              {/* Accounting entries table */}
              {showAccountingEntries && (
                <div className="mt-4 border rounded-md p-4">
                  <div className="grid grid-cols-6 gap-2 font-medium text-sm mb-2">
                    <div>Compte</div>
                    <div>Libellé</div>
                    <div className="text-right">Débit</div>
                    <div className="text-right">Crédit</div>
                    <div>Taxes</div>
                    <div>Code de taxe</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-sm py-2 border-b">
                    <div>61110000 Achats de...</div>
                    <div>
                      {invoice.partner} - N<br />
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-right">
                      {invoice.amount?.toFixed(2)} {invoice.currency || "DH"}
                    </div>
                    <div className="text-right">0,00 {invoice.currency || "DH"}</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">TVA 20% ACHATS</span>
                    </div>
                    <div className="flex items-center">
                      <span>140 - Prestations de...</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 ml-1">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-sm py-2 border-b">
                    <div>34552200 Etat - TV...</div>
                    <div>
                      {invoice.partner} - N<br />
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-right">
                      {invoice.vatAmount?.toFixed(2)} {invoice.currency || "DH"}
                    </div>
                    <div className="text-right">0,00 {invoice.currency || "DH"}</div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-sm py-2 border-b">
                    <div>44110000 Fournisse...</div>
                    <div>
                      {invoice.partner} - N<br />
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-right">0,00 {invoice.currency || "DH"}</div>
                    <div className="text-right">
                      {invoice.amountWithTax?.toFixed(2)} {invoice.currency || "DH"}
                    </div>
                    <div></div>
                    <div></div>
                  </div>

                  <div className="mt-2">
                    <Button variant="link" className="text-primary text-sm p-0">
                      Ajouter une ligne
                    </Button>
                  </div>

                  <div className="flex justify-end mt-4 text-sm font-medium">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-right">{invoice.amountWithTax?.toFixed(2)}</div>
                      <div className="text-right">{invoice.amountWithTax?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                {invoice.fileUrl ? (
                  <div
                    className="bg-white shadow-md max-h-full"
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "center",
                      transition: "transform 0.2s",
                    }}
                  >
                    {invoice.fileUrl.endsWith(".pdf") ? (
                      <iframe
                        src={invoice.fileUrl + "#toolbar=0&navpanes=0"}
                        title="Invoice PDF"
                        className="w-[600px] h-[calc(100vh-200px)]"
                        style={{ border: "none" }}
                      />
                    ) : (
                      <img
                        src={invoice.fileUrl || "/placeholder.svg"}
                        alt="Invoice document"
                        className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=800&width=600"
                          console.error("Error loading image:", invoice.fileUrl)
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Aucun document disponible</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
