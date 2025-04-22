"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { FadeIn } from "@/components/ui/motion"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Edit,
  Save,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  Check,
} from "lucide-react"

interface ModernInvoiceDetailProps {
  id: string
  documentType: "purchases" | "sales" | "cashReceipts" | "bankStatements"
}

export function ModernInvoiceDetail({ id, documentType }: ModernInvoiceDetailProps) {
  const router = useRouter()
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDocument, setEditedDocument] = useState<any>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAccountingEntries, setShowAccountingEntries] = useState(false)
  const [accountingEntries, setAccountingEntries] = useState<any[]>([
    {
      id: "1",
      account: "61110000",
      label: 'Achats de marchandises "groupe A"',
      debit: 5605.0,
      credit: 0.0,
      tax: "TVA 20% ACHATS",
      taxCode: "140 - Prestations de services",
    },
    {
      id: "2",
      account: "34552200",
      label: "Etat - TVA récupérable",
      debit: 1121.0,
      credit: 0.0,
      tax: "",
      taxCode: "",
    },
    {
      id: "3",
      account: "44110000",
      label: "Fournisseurs",
      debit: 0.0,
      credit: 6726.0,
      tax: "",
      taxCode: "",
    },
  ])
  const [activeTab, setActiveTab] = useState("details")

  const pdfContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load document from localStorage
    const companyId = localStorage.getItem("selectedCompanyId") || "default"
    const storageKey = `${documentType}_${companyId}`
    const documentsJson = localStorage.getItem(storageKey)

    if (documentsJson) {
      const documents = JSON.parse(documentsJson)
      const foundDocument = documents.find((doc: any) => doc.id === id)

      if (foundDocument) {
        setDocument(foundDocument)
        setEditedDocument(foundDocument)
        setTotalPages(1) // For demo purposes, assume 1 page
      } else {
        toast({
          title: "Document non trouvé",
          description: "Le document demandé n'existe pas",
          variant: "destructive",
        })
        router.push(`/dashboard/${documentType}`)
      }
    } else {
      toast({
        title: "Aucun document",
        description: "Aucun document n'a été trouvé",
        variant: "destructive",
      })
      router.push(`/dashboard/${documentType}`)
    }

    setIsLoading(false)
  }, [id, documentType, router])

  const handleSave = () => {
    if (!editedDocument) return

    // Save to localStorage
    const companyId = localStorage.getItem("selectedCompanyId") || "default"
    const storageKey = `${documentType}_${companyId}`
    const documentsJson = localStorage.getItem(storageKey)

    if (documentsJson) {
      const documents = JSON.parse(documentsJson)
      const updatedDocuments = documents.map((doc: any) => (doc.id === id ? editedDocument : doc))

      localStorage.setItem(storageKey, JSON.stringify(updatedDocuments))
      setDocument(editedDocument)
      setIsEditing(false)

      toast({
        title: "Document mis à jour",
        description: "Les modifications ont été enregistrées",
        variant: "default",
      })
    }
  }

  const handleCancel = () => {
    setEditedDocument(document)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    if (!editedDocument) return

    setEditedDocument({
      ...editedDocument,
      [field]: value,
    })
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleAddAccountingEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      account: "",
      label: "",
      debit: 0,
      credit: 0,
      tax: "",
      taxCode: "",
    }

    setAccountingEntries([...accountingEntries, newEntry])
  }

  const handleRemoveAccountingEntry = (id: string) => {
    setAccountingEntries(accountingEntries.filter((entry) => entry.id !== id))
  }

  const handleAccountingEntryChange = (id: string, field: string, value: any) => {
    setAccountingEntries(accountingEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case "purchases":
        return "Achats"
      case "sales":
        return "Ventes"
      case "cashReceipts":
        return "Bons de caisse"
      case "bankStatements":
        return "Relevés bancaires"
      default:
        return "Document"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium">Document non trouvé</h2>
        <p className="text-muted-foreground mt-2">Le document demandé n'existe pas ou a été supprimé.</p>
        <Button className="mt-6" onClick={() => router.push(`/dashboard/${documentType}`)}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  const totalDebit = accountingEntries.reduce((sum, entry) => sum + (Number.parseFloat(entry.debit) || 0), 0)
  const totalCredit = accountingEntries.reduce((sum, entry) => sum + (Number.parseFloat(entry.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/${documentType}`)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-3">
                {document.name}
                {document.hasWarning && (
                  <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Attention
                  </Badge>
                )}
              </h1>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Badge variant="outline" className="mr-2 font-normal">
                  {getDocumentTypeLabel()}
                </Badge>
                <span>Créé le {document.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(document.fileUrl, "_blank")}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
                <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1">
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} className="gap-1">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn className="space-y-6" delay={0.1}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="accounting">Comptabilité</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fournisseur</label>
                      {isEditing ? (
                        <Input
                          value={editedDocument.partner}
                          onChange={(e) => handleInputChange("partner", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{document.partner}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Compte de charge</label>
                      {isEditing ? (
                        <Input value='61110000 Achats de marchandises "groupe A"' disabled />
                      ) : (
                        <p className="text-sm">61110000 Achats de marchandises "groupe A"</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Devise</label>
                      {isEditing ? <Input value="MAD" disabled /> : <p className="text-sm">MAD</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Numéro de facture</label>
                      {isEditing ? (
                        <Input
                          value={editedDocument.invoiceNumber}
                          onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{document.invoiceNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date de facturation</label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedDocument.invoiceDate}
                          onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{document.invoiceDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Retenue à la source</label>
                      <div className="flex items-center">
                        {isEditing ? (
                          <Checkbox
                            id="withholding"
                            checked={editedDocument.withholding}
                            onCheckedChange={(checked) => handleInputChange("withholding", checked)}
                          />
                        ) : (
                          <Checkbox id="withholding" checked={document.withholding} disabled />
                        )}
                        <label htmlFor="withholding" className="ml-2 text-sm">
                          Appliquer une retenue à la source
                        </label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant HT</label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editedDocument.amount}
                            onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value))}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">DH</span>
                        </div>
                      ) : (
                        <p className="text-sm">{document.amount.toFixed(2)} DH</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant TVA</label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editedDocument.vatAmount}
                            onChange={(e) => handleInputChange("vatAmount", Number.parseFloat(e.target.value))}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">DH</span>
                        </div>
                      ) : (
                        <p className="text-sm">{document.vatAmount.toFixed(2)} DH</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Droits de timbre</label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editedDocument.stampDuty || 0}
                            onChange={(e) => handleInputChange("stampDuty", Number.parseFloat(e.target.value))}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">DH</span>
                        </div>
                      ) : (
                        <p className="text-sm">{(document.stampDuty || 0).toFixed(2)} DH</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Débours</label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editedDocument.expenses || 0}
                            onChange={(e) => handleInputChange("expenses", Number.parseFloat(e.target.value))}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">DH</span>
                        </div>
                      ) : (
                        <p className="text-sm">{(document.expenses || 0).toFixed(2)} DH</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant TTC</label>
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={editedDocument.amountWithTax}
                            onChange={(e) => handleInputChange("amountWithTax", Number.parseFloat(e.target.value))}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-2 text-muted-foreground text-sm">DH</span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium">{document.amountWithTax.toFixed(2)} DH</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center">
                      {isEditing ? (
                        <Checkbox
                          id="nonRecoverableVAT"
                          checked={editedDocument.nonRecoverableVAT}
                          onCheckedChange={(checked) => handleInputChange("nonRecoverableVAT", checked)}
                        />
                      ) : (
                        <Checkbox id="nonRecoverableVAT" checked={document.nonRecoverableVAT} disabled />
                      )}
                      <label htmlFor="nonRecoverableVAT" className="ml-2 text-sm">
                        TVA non Récupérable
                      </label>
                    </div>

                    <div className="flex items-center">
                      {isEditing ? (
                        <Checkbox
                          id="multipleVATRates"
                          checked={editedDocument.multipleVATRates}
                          onCheckedChange={(checked) => handleInputChange("multipleVATRates", checked)}
                        />
                      ) : (
                        <Checkbox id="multipleVATRates" checked={document.multipleVATRates} disabled />
                      )}
                      <label htmlFor="multipleVATRates" className="ml-2 text-sm">
                        Plusieurs montants de TVA
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAccountingEntries(true)}
                      className="w-full"
                    >
                      Écritures
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {document.hasWarning && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center text-amber-700">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      Attention
                    </CardTitle>
                    <CardDescription className="text-amber-700/80">
                      Cette facture présente des anomalies qui nécessitent votre attention.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-amber-700/90">
                    <p>La date de cette facture ne correspond pas à l'exercice fiscal courant.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="accounting" className="space-y-6 pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Écritures comptables
                  </CardTitle>
                  <CardDescription>Gérez les écritures comptables associées à ce document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 text-sm font-medium">Compte</th>
                          <th className="text-left py-2 px-2 text-sm font-medium">Libellé</th>
                          <th className="text-right py-2 px-2 text-sm font-medium">Débit</th>
                          <th className="text-right py-2 px-2 text-sm font-medium">Crédit</th>
                          <th className="text-left py-2 px-2 text-sm font-medium">Taxes</th>
                          <th className="text-left py-2 px-2 text-sm font-medium">Code de taxe</th>
                          <th className="text-center py-2 px-2 text-sm font-medium w-10">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountingEntries.map((entry, index) => (
                          <tr key={entry.id} className="border-b">
                            <td className="py-2 px-2">
                              {isEditing ? (
                                <Input
                                  value={entry.account}
                                  onChange={(e) => handleAccountingEntryChange(entry.id, "account", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm">{entry.account}</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {isEditing ? (
                                <Input
                                  value={entry.label}
                                  onChange={(e) => handleAccountingEntryChange(entry.id, "label", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm">{entry.label}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={entry.debit}
                                  onChange={(e) =>
                                    handleAccountingEntryChange(
                                      entry.id,
                                      "debit",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="h-8 text-sm text-right"
                                />
                              ) : (
                                <span className="text-sm">{entry.debit.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={entry.credit}
                                  onChange={(e) =>
                                    handleAccountingEntryChange(
                                      entry.id,
                                      "credit",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="h-8 text-sm text-right"
                                />
                              ) : (
                                <span className="text-sm">{entry.credit.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {isEditing ? (
                                <Input
                                  value={entry.tax}
                                  onChange={(e) => handleAccountingEntryChange(entry.id, "tax", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm">{entry.tax}</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {isEditing ? (
                                <Input
                                  value={entry.taxCode}
                                  onChange={(e) => handleAccountingEntryChange(entry.id, "taxCode", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm">{entry.taxCode}</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {isEditing && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAccountingEntry(entry.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={2} className="py-2 px-2 text-sm font-medium">
                            Total
                          </td>
                          <td className="py-2 px-2 text-right text-sm font-medium">{totalDebit.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right text-sm font-medium">{totalCredit.toFixed(2)}</td>
                          <td colSpan={3} className="py-2 px-2">
                            {!isBalanced && (
                              <Badge
                                variant="outline"
                                className="text-destructive border-destructive/20 bg-destructive/10"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Déséquilibré
                              </Badge>
                            )}
                            {isBalanced && (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                <Check className="h-3 w-3 mr-1" />
                                Équilibré
                              </Badge>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={handleAddAccountingEntry} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une ligne
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <p className="text-sm text-muted-foreground">
                    Les écritures comptables seront générées automatiquement lors de la validation du document.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Document
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="h-8 w-8"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 2.5}
                    className="h-8 w-8"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setZoomLevel(1)} className="h-8 w-8">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center justify-center bg-muted/30 rounded-b-lg">
              <div
                ref={pdfContainerRef}
                className="relative w-full h-[600px] overflow-auto flex items-center justify-center"
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center top",
                    transition: "transform 0.2s ease-out",
                  }}
                  className="p-4"
                >
                  {document?.fileUrl ? (
                    document.fileUrl.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${document.fileUrl}#toolbar=0&navpanes=0`}
                        className="w-[595px] h-[842px] border shadow-md bg-white"
                        title="Document PDF"
                      />
                    ) : document.fileUrl.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                      <img
                        src={document.fileUrl || "/placeholder.svg"}
                        alt="Document"
                        className="max-w-full border shadow-md bg-white"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=842&width=595"
                          e.currentTarget.alt = "Error loading image"
                        }}
                      />
                    ) : (
                      <div className="p-8 bg-white border rounded-lg shadow-md flex flex-col items-center justify-center w-[595px]">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Document Preview</h3>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          This document type cannot be previewed directly.
                          <br />
                          <Button
                            variant="link"
                            className="text-primary p-0 h-auto mt-2"
                            onClick={() => window.open(document.fileUrl, "_blank")}
                          >
                            Download to view
                          </Button>
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center text-muted-foreground bg-white border rounded-lg shadow-md w-[595px]">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Document Available</h3>
                      <p className="mt-2">There is no document attached to this invoice.</p>
                    </div>
                  )}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-3 border-t w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
