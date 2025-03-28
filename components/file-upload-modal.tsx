"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileUp, X, Check, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DocumentType = "purchases" | "sales" | "cashReceipts" | "bankStatements"

interface FileUploadModalProps {
  open: boolean
  onClose: () => void
  documentType: DocumentType
  onUploadComplete: (data: any) => void
}

export function FileUploadModal({ open, onClose, documentType, onUploadComplete }: FileUploadModalProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "results">("upload")
  const [ocrResults, setOcrResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    // Filter for supported file types
    const supportedFiles = newFiles.filter((file) => {
      const fileType = file.type.toLowerCase()
      return (
        fileType.includes("pdf") ||
        fileType.includes("image/jpeg") ||
        fileType.includes("image/png") ||
        fileType.includes("image/jpg")
      )
    })

    if (supportedFiles.length === 0) {
      setError("Veuillez sélectionner des fichiers PDF ou images (JPG, PNG)")
      return
    }

    setFiles(supportedFiles)
    setError(null)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setCurrentStep("processing")
    setProgress(10)

    try {
      // Simulate OCR processing
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(30)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(70)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(100)

      // Mock OCR results
      const mockOcrResults = {
        rawText:
          "HITECH LAND\nFacture N° : FA21 20210460\nDate : 13/02/2021\nClient : 003119\n\nRéférence : 01.0001\nDésignation : Ordinateur portable\nQté : 1\nP.U.HT : 5 605,00\nMontant HT : 5 605,00\n\nTVA 20% : 1 121,00\nMontant TTC : 6 726,00",
        invoice: {
          supplier: "HITECH LAND",
          invoiceNumber: "FA21 20210460",
          invoiceDate: "13/02/2021",
          amount: 5605.0,
          vatAmount: 1121.0,
          amountWithTax: 6726.0,
          currency: "MAD",
          confidence: 0.85,
        },
        originalFile: {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        },
        documentType: documentType,
      }

      setOcrResults(mockOcrResults)
      setCurrentStep("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
      setCurrentStep("upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirm = () => {
    if (ocrResults) {
      // Add file information to the results
      const result = {
        ...ocrResults,
        originalFile: {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        },
        documentType: documentType,
      }

      // Save the document and get its ID
      const companyId = localStorage.getItem("selectedCompanyId")
      if (!companyId) return

      // Create a new document from OCR results
      const newDocument = {
        id: Math.random().toString(36).substring(2, 9),
        name: result.invoice.supplier
          ? `Facture ${result.invoice.supplier}`
          : `Document ${new Date().toLocaleDateString()}`,
        description: result.originalFile.name,
        invoiceNumber:
          result.invoice.invoiceNumber ||
          `INV-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`,
        partner: result.invoice.supplier || "Fournisseur inconnu",
        invoiceDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
        dueDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
        createdAt: new Date().toLocaleDateString(),
        amount: result.invoice.amount || 0,
        amountWithTax: result.invoice.amountWithTax || 0,
        vatAmount: result.invoice.vatAmount || 0,
        type: "facture",
        paymentStatus: "non-paye",
        declarationStatus: "non-declare",
        status: "en-cours",
        hasWarning: result.invoice.confidence < 0.7,
        documentType: documentType,
        ocrConfidence: result.invoice.confidence,
        rawText: result.rawText,
      }

      // Get existing documents
      const storageKey = `${documentType}_${companyId}`
      const existingDocumentsJson = localStorage.getItem(storageKey)
      const existingDocuments = existingDocumentsJson ? JSON.parse(existingDocumentsJson) : []

      // Save to localStorage
      const updatedDocuments = [newDocument, ...existingDocuments]
      localStorage.setItem(storageKey, JSON.stringify(updatedDocuments))

      // Close the modal
      onClose()

      // Redirect to the invoice detail page
      let redirectPath = ""
      switch (documentType) {
        case "purchases":
          redirectPath = `/dashboard/invoices/${newDocument.id}`
          break
        case "sales":
          redirectPath = `/dashboard/sales/${newDocument.id}`
          break
        case "cashReceipts":
          redirectPath = `/dashboard/cash-receipts/${newDocument.id}`
          break
        case "bankStatements":
          redirectPath = `/dashboard/bank-statements/${newDocument.id}`
          break
      }

      if (redirectPath) {
        router.push(redirectPath)
      }
    }
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Charger un document - {getDocumentTypeLabel()}</DialogTitle>
        </DialogHeader>

        {currentStep === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">Glissez-déposez votre fichier ici</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                ou{" "}
                <span className="text-primary cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  parcourez vos fichiers
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Formats supportés: PDF, JPG, PNG</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {files.length > 0 && (
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                      <FileUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{files[0].name}</p>
                      <p className="text-xs text-muted-foreground">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setFiles([])} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
                Traiter avec OCR
              </Button>
            </div>
          </div>
        )}

        {currentStep === "processing" && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">Traitement OCR en cours</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Veuillez patienter pendant que nous analysons votre document...
              </p>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="text-center text-sm text-muted-foreground">
              {progress < 30 && "Préparation du document..."}
              {progress >= 30 && progress < 70 && "Analyse OCR en cours..."}
              {progress >= 70 && "Extraction des données..."}
            </div>
          </div>
        )}

        {currentStep === "results" && ocrResults && (
          <div className="space-y-4">
            <Tabs defaultValue="preview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="data">Données extraites</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Texte extrait</h3>
                  <div className="max-h-[300px] overflow-y-auto text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                    {ocrResults.rawText || "Aucun texte extrait"}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Données de la facture</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Fournisseur:</p>
                      <p className="font-medium">{ocrResults.invoice.supplier || "Non détecté"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Numéro de facture:</p>
                      <p className="font-medium">{ocrResults.invoice.invoiceNumber || "Non détecté"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Date de facture:</p>
                      <p className="font-medium">{ocrResults.invoice.invoiceDate || "Non détecté"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Montant HT:</p>
                      <p className="font-medium">
                        {ocrResults.invoice.amount
                          ? `${ocrResults.invoice.amount.toFixed(2)} ${ocrResults.invoice.currency || "MAD"}`
                          : "Non détecté"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">TVA:</p>
                      <p className="font-medium">
                        {ocrResults.invoice.vatAmount
                          ? `${ocrResults.invoice.vatAmount.toFixed(2)} ${ocrResults.invoice.currency || "MAD"}`
                          : "Non détecté"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Montant TTC:</p>
                      <p className="font-medium">
                        {ocrResults.invoice.amountWithTax
                          ? `${ocrResults.invoice.amountWithTax.toFixed(2)} ${ocrResults.invoice.currency || "MAD"}`
                          : "Non détecté"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${ocrResults.invoice.confidence > 0.7 ? "bg-green-500" : ocrResults.invoice.confidence > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                  ></div>
                  <span>
                    Confiance: {Math.round(ocrResults.invoice.confidence * 100)}%
                    {ocrResults.invoice.confidence > 0.7
                      ? " (Élevée)"
                      : ocrResults.invoice.confidence > 0.4
                        ? " (Moyenne)"
                        : " (Faible)"}
                  </span>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                Retour
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                Confirmer et enregistrer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

