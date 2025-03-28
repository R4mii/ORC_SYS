"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Edit, Pencil, Save, X, ExternalLink } from "lucide-react"
import { PartnerModal } from "@/components/partner-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  accountCode?: string
  currency?: string
  vatAmount?: string
  stampDuty?: string
  expenses?: string
  withholding?: boolean
  vatProrated?: boolean
  nonRecoverableVAT?: boolean
  multipleVATAmounts?: boolean
  accountingEntries?: any[]
  warning?: string
  fileUrl?: string
  fileName?: string
  documentType?: string // Added for categorization
  ocrRawText?: string
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [previewScale, setPreviewScale] = useState(1)
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [partnerModalOpen, setPartnerModalOpen] = useState(false)
  const [previousInvoice, setPreviousInvoice] = useState<boolean>(false)
  const [periodicInvoice, setPeriodicInvoice] = useState<boolean>(false)
  const [withholding, setWithholding] = useState<boolean>(false)
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)

  // Load invoice data
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

    // Get invoices for this company - check both purchases and sales
    const purchasesJson = localStorage.getItem(`purchases_${companyId}`)
    const salesJson = localStorage.getItem(`sales_${companyId}`)

    let invoice = null
    let documentType = ""

    // Check purchases first
    if (purchasesJson) {
      const purchases = JSON.parse(purchasesJson)
      invoice = purchases.find((inv: Invoice) => inv.id === params.id)
      if (invoice) documentType = "purchases"
    }

    // If not found in purchases, check sales
    if (!invoice && salesJson) {
      const sales = JSON.parse(salesJson)
      invoice = sales.find((inv: Invoice) => inv.id === params.id)
      if (invoice) documentType = "sales"
    }

    // If still not found, check other document types
    if (!invoice) {
      const cashReceiptsJson = localStorage.getItem(`cashReceipts_${companyId}`)
      const bankStatementsJson = localStorage.getItem(`bankStatements_${companyId}`)

      if (cashReceiptsJson) {
        const cashReceipts = JSON.parse(cashReceiptsJson)
        invoice = cashReceipts.find((inv: Invoice) => inv.id === params.id)
        if (invoice) documentType = "cashReceipts"
      }

      if (!invoice && bankStatementsJson) {
        const bankStatements = JSON.parse(bankStatementsJson)
        invoice = bankStatements.find((inv: Invoice) => inv.id === params.id)
        if (invoice) documentType = "bankStatements"
      }
    }

    if (invoice) {
      // If it's a newly uploaded invoice with minimal data, add default values
      if (!invoice.accountCode) {
        const enhancedInvoice: Invoice = {
          ...invoice,
          accountCode: '61110000 Achats de marchandises "groupe A"',
          currency: "MAD",
          vatAmount: "0,00",
          stampDuty: "0,00",
          expenses: "0,00",
          withholding: false,
          vatProrated: true,
          nonRecoverableVAT: false,
          multipleVATAmounts: false,
          documentType: documentType, // Store the document type
          accountingEntries: [
            {
              account: "61110000 Achats de marchandises",
              description: `${invoice.partner || ""} - ${invoice.invoiceNumber || ""}`,
              debit: "0,00 DH",
              credit: "0,00 DH",
              tax: "TVA 20% ACHATS",
              taxCode: "140 - Prestations de services",
            },
            {
              account: "34552200 État - TVA récupérable",
              description: `${invoice.partner || ""} - ${invoice.invoiceNumber || ""}`,
              debit: "0,00 DH",
              credit: "0,00 DH",
              tax: "",
              taxCode: "",
            },
            {
              account: "44110000 Fournisseurs",
              description: `${invoice.partner || ""} - ${invoice.invoiceNumber || ""}`,
              debit: "0,00 DH",
              credit: "0,00 DH",
              tax: "",
              taxCode: "",
            },
          ],
          warning: "Cette facture nécessite votre attention pour compléter les informations manquantes.",
        }
        setInvoiceData(enhancedInvoice)
      } else {
        setInvoiceData({ ...invoice, documentType })
      }
    } else {
      // If invoice not found, redirect to invoices list
      router.push("/dashboard/invoices")
    }
  }, [params.id, router])

  // Inside the InvoiceDetailPage component, add this function to update the invoice with extracted data

  const updateInvoiceWithExtractedData = (extractedData: any) => {
    if (!invoiceData || !extractedData) return

    // Update the invoice with extracted data
    const updatedInvoice = {
      ...invoiceData,
      invoiceNumber: extractedData.invoiceNumber || invoiceData.invoiceNumber,
      invoiceDate: extractedData.invoiceDate || invoiceData.invoiceDate,
      amount: extractedData.amount || invoiceData.amount,
      amountWithTax: extractedData.amountWithTax || invoiceData.amountWithTax,
      partner: extractedData.supplier || invoiceData.partner,
      // Add vatAmount if needed
      vatAmount: extractedData.vatAmount || invoiceData.vatAmount || "0,00",
      // Add OCR raw text for reference
      ocrRawText: extractedData.rawText,
    }

    setInvoiceData(updatedInvoice)

    // Recalculate total if needed
    setTimeout(() => calculateTotalAmount(), 100)
  }

  // Update the invoice data when editing is enabled/disabled
  useEffect(() => {
    if (invoiceData && isEditing) {
      setWithholding(invoiceData.withholding || false)
      setPreviousInvoice(false)
      setPeriodicInvoice(false)
    }
  }, [isEditing, invoiceData])

  // Calculate total amount when component values change
  useEffect(() => {
    if (isEditing && invoiceData) {
      calculateTotalAmount()
    }
  }, [isEditing])

  const calculateTotalAmount = () => {
    if (!invoiceData) return

    // Parse numeric values, handling comma as decimal separator
    const parseAmount = (value: string | number) => {
      if (typeof value === "number") return value
      return Number.parseFloat(value.replace(",", ".")) || 0
    }

    const amount = parseAmount(invoiceData.amount)
    const vatAmount = parseAmount(invoiceData.vatAmount || "0")
    const stampDuty = parseAmount(invoiceData.stampDuty || "0")
    const expenses = parseAmount(invoiceData.expenses || "0")

    // Calculate total: Montant TTC = Montant HT + Montant TVA + Droits de Timbre + Debours
    const total = amount + vatAmount + stampDuty + expenses

    // Update the invoice data with the new total
    setInvoiceData({
      ...invoiceData,
      amountWithTax: total,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    if (!invoiceData) return

    setInvoiceData({
      ...invoiceData,
      [field]: value,
    })

    // Recalculate total amount after a short delay to ensure state is updated
    setTimeout(() => calculateTotalAmount(), 100)
  }

  const handleSavePartner = (partner: any) => {
    if (!invoiceData) return

    setInvoiceData({
      ...invoiceData,
      partner: `${partner.name} - ${partner.identifiers.if}`,
    })
  }

  const handleSaveInvoice = () => {
    if (!invoiceData || !currentCompanyId || !invoiceData.documentType) return

    // Update withholding from the checkbox state
    const updatedInvoice = {
      ...invoiceData,
      withholding,
    }

    // Get the storage key based on document type
    const storageKey = `${invoiceData.documentType}_${currentCompanyId}`

    // Get all documents for this type
    const documentsJson = localStorage.getItem(storageKey)
    if (!documentsJson) return

    const documents = JSON.parse(documentsJson)

    // Update the document in the array
    const updatedDocuments = documents.map((doc: Invoice) => (doc.id === updatedInvoice.id ? updatedInvoice : doc))

    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedDocuments))

    setInvoiceData(updatedInvoice)
    setIsEditing(false)
    alert("Invoice saved successfully!")
  }

  // Add this function to handle adding a new accounting entry
  const addAccountingEntry = () => {
    if (!invoiceData) return

    const newEntry = {
      account: "",
      description: `${invoiceData.partner || ""} - ${invoiceData.invoiceNumber || ""}`,
      debit: "0,00 DH",
      credit: "0,00 DH",
      tax: "",
      taxCode: "",
    }

    const updatedInvoice = {
      ...invoiceData,
      accountingEntries: [...(invoiceData.accountingEntries || []), newEntry],
    }

    setInvoiceData(updatedInvoice)
  }

  // Add this function to handle editing an accounting entry
  const handleEntryChange = (index: number, field: string, value: string) => {
    if (!invoiceData || !invoiceData.accountingEntries) return

    const updatedEntries = [...invoiceData.accountingEntries]
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    }

    setInvoiceData({
      ...invoiceData,
      accountingEntries: updatedEntries,
    })
  }

  if (!invoiceData) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {invoiceData.documentType === "purchases"
              ? "Achats"
              : invoiceData.documentType === "sales"
                ? "Ventes"
                : invoiceData.documentType === "cashReceipts"
                  ? "Bons de caisse"
                  : "Relevés bancaires"}{" "}
            - {invoiceData.name}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Abandonner
              </Button>
              <Button size="sm" onClick={handleSaveInvoice}>
                <Save className="h-4 w-4 mr-1" />
                Sauver
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <X className="h-4 w-4 mr-1" />
                Abandonner
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Valider
              </Button>
            </>
          )}
        </div>
      </div>

      {invoiceData.warning && (
        <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription>{invoiceData.warning}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Détails
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Fournisseur</Label>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Input
                              id="supplier"
                              value={invoiceData.partner}
                              onChange={(e) => handleInputChange("partner", e.target.value)}
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon" onClick={() => setPartnerModalOpen(true)}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Input id="supplier" value={invoiceData.partner} readOnly />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountCode">Compte de charge</Label>
                      {isEditing ? (
                        <Select
                          value={invoiceData.accountCode}
                          onValueChange={(value) => handleInputChange("accountCode", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un compte" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='61110000 Achats de marchandises "groupe A"'>
                              61110000 Achats de marchandises "groupe A"
                            </SelectItem>
                            <SelectItem value="61120000 Achats de matières premières">
                              61120000 Achats de matières premières
                            </SelectItem>
                            <SelectItem value="61300000 Achats de services">61300000 Achats de services</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input id="accountCode" value={invoiceData.accountCode} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      {isEditing ? (
                        <Select
                          value={invoiceData.currency}
                          onValueChange={(value) => handleInputChange("currency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une devise" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MAD">MAD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input id="currency" value={invoiceData.currency} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                      {isEditing ? (
                        <Input
                          id="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                        />
                      ) : (
                        <Input id="invoiceNumber" value={invoiceData.invoiceNumber} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Date de facturation</Label>
                      {isEditing ? (
                        <Input
                          id="invoiceDate"
                          type="date"
                          value={invoiceData.invoiceDate ? invoiceData.invoiceDate.split("/").reverse().join("-") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const date = new Date(e.target.value)
                              const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
                              handleInputChange("invoiceDate", formattedDate)
                            }
                          }}
                        />
                      ) : (
                        <Input id="invoiceDate" value={invoiceData.invoiceDate} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousInvoice">Facture antérieure</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="previousInvoice"
                          checked={previousInvoice}
                          disabled={!isEditing}
                          onCheckedChange={(checked) => setPreviousInvoice(checked as boolean)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodicInvoice">Facture périodique</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="periodicInvoice"
                          checked={periodicInvoice}
                          disabled={!isEditing}
                          onCheckedChange={(checked) => setPeriodicInvoice(checked as boolean)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="withholding">Retenue à la source</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="withholding"
                          checked={withholding}
                          disabled={!isEditing}
                          onCheckedChange={(checked) => setWithholding(checked as boolean)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amountExclTax">Montant HT</Label>
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            id="amountExclTax"
                            value={
                              typeof invoiceData.amount === "number"
                                ? invoiceData.amount.toString()
                                : invoiceData.amount
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.,]/g, "")
                              handleInputChange("amount", value)
                            }}
                          />
                          <span className="ml-2">DH</span>
                        </div>
                      ) : (
                        <Input id="amountExclTax" value={`${invoiceData.amount} DH`} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vatAmount">Montant TVA</Label>
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            id="vatAmount"
                            value={invoiceData.vatAmount}
                            onChange={(e) => handleInputChange("vatAmount", e.target.value)}
                          />
                          <span className="ml-2">DH</span>
                        </div>
                      ) : (
                        <Input id="vatAmount" value={`${invoiceData.vatAmount} DH`} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stampDuty">Droits de timbre</Label>
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            id="stampDuty"
                            value={invoiceData.stampDuty}
                            onChange={(e) => handleInputChange("stampDuty", e.target.value)}
                          />
                          <span className="ml-2">DH</span>
                        </div>
                      ) : (
                        <Input id="stampDuty" value={`${invoiceData.stampDuty} DH`} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expenses">Débours</Label>
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            id="expenses"
                            value={invoiceData.expenses}
                            onChange={(e) => handleInputChange("expenses", e.target.value)}
                          />
                          <span className="ml-2">DH</span>
                        </div>
                      ) : (
                        <Input id="expenses" value={`${invoiceData.expenses} DH`} readOnly />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Montant TTC</Label>
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            id="totalAmount"
                            value={
                              typeof invoiceData.amountWithTax === "number"
                                ? invoiceData.amountWithTax.toString()
                                : invoiceData.amountWithTax
                            }
                            readOnly
                          />
                          <span className="ml-2">DH</span>
                        </div>
                      ) : (
                        <Input id="totalAmount" value={`${invoiceData.amountWithTax} DH`} readOnly />
                      )}
                    </div>

                    {/* Écritures section moved under details */}
                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Écritures</h3>

                      <Button variant="outline" size="sm" onClick={addAccountingEntry}>
                        Ajouter une ligne
                      </Button>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Compte</TableHead>
                            <TableHead>Libellé</TableHead>
                            <TableHead className="text-right">Débit</TableHead>
                            <TableHead className="text-right">Crédit</TableHead>
                            <TableHead>Taxes</TableHead>
                            <TableHead>Code de taxe</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceData.accountingEntries &&
                            invoiceData.accountingEntries.map((entry, index) => (
                              <TableRow key={index}>
                                <TableCell>{entry.account}</TableCell>
                                <TableCell>{entry.description}</TableCell>
                                <TableCell className="text-right">{entry.debit}</TableCell>
                                <TableCell className="text-right">{entry.credit}</TableCell>
                                <TableCell>
                                  {entry.tax && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {entry.tax}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{entry.taxCode}</TableCell>
                                <TableCell>
                                  {entry.taxCode && (
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-sm">
                          <div>{invoiceData.amountWithTax} DH</div>
                          <div>{invoiceData.amountWithTax} DH</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label>Désignation de la déclaration</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between bg-muted p-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">1 of 1</div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.1))}
                >
                  <span>-</span>
                </Button>
                <select
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={`${Math.round(previewScale * 100)}%`}
                  onChange={(e) => setPreviewScale(Number.parseInt(e.target.value) / 100)}
                >
                  <option>50%</option>
                  <option>75%</option>
                  <option>100%</option>
                  <option>125%</option>
                  <option>150%</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPreviewScale(Math.min(2, previewScale + 0.1))}
                >
                  <span>+</span>
                </Button>
              </div>
            </div>

            <div className="h-[calc(100vh-300px)] overflow-auto bg-gray-100 flex items-center justify-center">
              <div
                style={{ transform: `scale(${previewScale})`, transformOrigin: "center", transition: "transform 0.2s" }}
              >
                {invoiceData.fileUrl ? (
                  <img
                    src={invoiceData.fileUrl || "/placeholder.svg"}
                    alt="Invoice preview"
                    className="max-w-full object-contain"
                    onError={(e) => {
                      console.error("Error loading invoice image:", e)
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=600&width=400"
                      ;(e.target as HTMLImageElement).alt = "Invoice preview not available"
                    }}
                  />
                ) : (
                  <div className="bg-white p-8 rounded shadow-md">
                    <p className="text-gray-500">No preview available for this invoice</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Modal */}
      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        onSave={handleSavePartner}
        initialPartner={{
          id: "1004450",
          name: "WANA CORPORATE EX MAROC CONNECT",
          type: "company",
          isSupplier: true,
          isClient: false,
          address: {
            line1: "LOT LA COLLINE 2 SIDI MAAROUF –ANFA (",
            line2: "Rue 2...",
            city: "CASABLANCA",
            country: "Maroc",
          },
          identifiers: {
            ice: "001527882000090",
            if: "1004450",
            rc: "99907",
            pat: "",
          },
          contact: {
            phone: "",
            mobile: "",
            email: "",
          },
          language: "French / Français",
        }}
      />
    </div>
  )
}

