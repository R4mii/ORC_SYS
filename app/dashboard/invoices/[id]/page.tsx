"use client"

import type React from "react"

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
  AlertCircle,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

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
      try {
        const invoices = JSON.parse(purchasesDocuments)
        const foundInvoice = invoices.find((inv: any) => inv.id === invoiceId)

        if (foundInvoice) {
          console.log("Found invoice:", foundInvoice)

          // Create a file URL if it doesn't exist but we have file data
          if (!foundInvoice.fileUrl) {
            if (foundInvoice.file instanceof Blob) {
              // If we have a Blob object
              foundInvoice.fileUrl = URL.createObjectURL(foundInvoice.file)
              console.log("Created URL from Blob")
            } else if (typeof foundInvoice.file === "string" && foundInvoice.file.startsWith("data:")) {
              // If we have a data URL
              foundInvoice.fileUrl = foundInvoice.file
              console.log("Using data URL")
            } else if (foundInvoice.fileData) {
              // If we have base64 data
              foundInvoice.fileUrl = foundInvoice.fileData
              console.log("Using fileData")
            } else {
              console.log("No file data available")
            }
          }

          setInvoice(foundInvoice)
          setFormData({
            supplier: foundInvoice.partner || "",
            accountCode: '61110000 Achats de marchandises "groupe A"',
            currency: "MAD",
            invoiceNumber: foundInvoice.invoiceNumber || "",
            invoiceDate: foundInvoice.invoiceDate || "",
            withholding: false,
            prorataTVA: true,
            amountHT: foundInvoice.amount || 0,
            amountTVA: foundInvoice.vatAmount || 0,
            stampDuty: 0,
            expenses: 0,
            amountTTC: foundInvoice.amountWithTax || 0,
            nonRecoverableTVA: false,
            multipleTVAAmounts: false,
          })
        } else {
          console.error("Invoice not found:", invoiceId)
          router.push("/dashboard/invoices")
        }
      } catch (error) {
        console.error("Error parsing invoice data:", error)
        setFileError("Erreur lors du chargement des données de la facture.")
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
      try {
        const invoices = JSON.parse(purchasesDocuments)
        const updatedInvoices = invoices.map((inv: any) => (inv.id === invoice.id ? updatedInvoice : inv))

        localStorage.setItem(`purchases_${companyId}`, JSON.stringify(updatedInvoices))

        // Redirect to invoices page
        router.push("/dashboard/invoices")
      } catch (error) {
        console.error("Error updating invoice:", error)
        alert("Une erreur s'est produite lors de la mise à jour de la facture.")
      }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setFileError(null)

    try {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file)

      // Update the invoice with the new file
      const updatedInvoice = {
        ...invoice,
        file: file,
        fileUrl: fileUrl,
        originalFile: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      }

      setInvoice(updatedInvoice)

      // Save to localStorage
      const companyId = localStorage.getItem("selectedCompanyId")
      if (companyId) {
        const purchasesDocuments = localStorage.getItem(`purchases_${companyId}`)
        if (purchasesDocuments) {
          const invoices = JSON.parse(purchasesDocuments)
          const updatedInvoices = invoices.map((inv: any) => (inv.id === invoice.id ? updatedInvoice : inv))

          localStorage.setItem(`purchases_${companyId}`, JSON.stringify(updatedInvoices))
          console.log("File saved to localStorage")
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setFileError("Erreur lors du téléchargement du fichier.")
    } finally {
      setUploadingFile(false)
    }
  }

  const renderFilePreview = () => {
    if (fileError) {
      return (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )
    }

    if (!invoice?.fileUrl) {
      return (
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 mb-4 text-muted-foreground/50" />
          <p className="mb-2">Aucun document disponible</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs mb-4">
            Veuillez télécharger un document pour cette facture.
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Télécharger un document</span>
            </div>
          </label>
        </div>
      )
    }

    // Determine file type
    const isPdf =
      invoice.fileUrl.toLowerCase().endsWith(".pdf") ||
      invoice.fileUrl.includes("data:application/pdf") ||
      invoice.originalFile?.type === "application/pdf"

    const isImage =
      invoice.fileUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif|webp)$/) ||
      invoice.fileUrl.includes("data:image/") ||
      (invoice.originalFile?.type && invoice.originalFile.type.startsWith("image/"))

    if (isPdf) {
      return (
        <iframe
          src={invoice.fileUrl + "#toolbar=0&navpanes=0"}
          title="Invoice PDF"
          className="w-full h-[calc(100vh-200px)]"
          style={{ border: "none" }}
          onError={() => {
            setFileError("Impossible de charger le PDF. Le fichier peut être corrompu ou inaccessible.")
          }}
        />
      )
    } else if (isImage) {
      return (
        <img
          src={invoice.fileUrl || "/placeholder.svg"}
          alt="Invoice document"
          className="max-w-full max-h-[calc(100vh-200px)] object-contain"
          onError={(e) => {
            console.error("Error loading image:", e)
            setFileError("Erreur lors du chargement de l'image. Le fichier peut être corrompu ou inaccessible.")
            e.currentTarget.src = "/placeholder.svg?height=800&width=600"
          }}
        />
      )
    } else {
      return (
        <div className="p-8 text-center">
          <div className="inline-block p-6 border rounded-lg shadow-md bg-muted/30 mb-4">
            <FileText className="h-16 w-16 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">{invoice.originalFile?.name || "Document"}</p>
          </div>
          <div>
            <a
              href={invoice.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
            >
              <Download className="h-4 w-4" /> Télécharger le fichier
            </a>
          </div>
        </div>
      )
    }
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Formulaire</TabsTrigger>
              <TabsTrigger value="ocr">Texte OCR</TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "form" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
                    <span className="ml-2 text-sm text-muted-foreground">DH</span>
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
                    <span className="ml-2 text-sm text-muted-foreground">DH</span>
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
                    <span className="ml-2 text-sm text-muted-foreground">DH</span>
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
                    <span className="ml-2 text-sm text-muted-foreground">DH</span>
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
                    <span className="ml-2 text-sm text-muted-foreground">DH</span>
                  </div>
                </div>

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
                        HITECK LAND - N<br />
                        FA21 20210460
                      </div>
                      <div className="text-right">5 829,20 DH</div>
                      <div className="text-right">0,00 DH</div>
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
                        HITECK LAND - N<br />
                        FA21 20210460
                      </div>
                      <div className="text-right">896,80 DH</div>
                      <div className="text-right">0,00 DH</div>
                      <div></div>
                      <div></div>
                    </div>

                    <div className="grid grid-cols-6 gap-2 text-sm py-2 border-b">
                      <div>44110000 Fournisse...</div>
                      <div>
                        HITECK LAND - N<br />
                        FA21 20210460
                      </div>
                      <div className="text-right">0,00 DH</div>
                      <div className="text-right">6 726,00 DH</div>
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
                        <div className="text-right">6 726,00</div>
                        <div className="text-right">6 726,00</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ocr" && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Texte extrait par OCR</h3>
                <div className="max-h-[500px] overflow-y-auto text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                  {invoice.rawText || "Aucun texte OCR disponible pour ce document"}
                </div>
              </div>

              {invoice.ocrConfidence && (
                <div className="flex items-center space-x-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${invoice.ocrConfidence > 0.7 ? "bg-green-500" : invoice.ocrConfidence > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                  ></div>
                  <span>
                    Confiance OCR: {Math.round(invoice.ocrConfidence * 100)}%
                    {invoice.ocrConfidence > 0.7
                      ? " (Élevée)"
                      : invoice.ocrConfidence > 0.4
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
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* File upload button */}
          <div className="bg-muted/30 p-4 border-b flex justify-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                <span>{invoice?.fileUrl ? "Remplacer le document" : "Télécharger un document"}</span>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
            </label>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="bg-white shadow-md max-h-full"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "center",
                    transition: "transform 0.2s",
                  }}
                >
                  {renderFilePreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
