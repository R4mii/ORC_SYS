"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileUp, X, Check, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

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
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      setFile(e.target.files[0])
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
      // Create form data for API request
      const formData = new FormData()
      formData.append("file", files[0])

      setProgress(30)

      // Call our OCR API endpoint
      const response = await fetch("/api/ocr/process", {
        method: "POST",
        body: formData,
      })

      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors du traitement OCR")
      }

      const data = await response.json()
      setProgress(100)

      // Set OCR results and move to results step
      setOcrResults(data)
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
        // Add the file URL
        fileUrl: URL.createObjectURL(files[0]),
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

  const handleOCRProcess = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a blob URL for the file to display in the invoice detail page
      const fileUrl = URL.createObjectURL(file)

      // Simulate OCR processing
      const ocrData = simulateOCRProcessing()

      // Store the OCR data and file URL in localStorage
      localStorage.setItem("ocrData", JSON.stringify(ocrData))
      localStorage.setItem("fileUrl", fileUrl)
      localStorage.setItem("fileName", file.name)

      // Close the modal and redirect to the invoice detail page
      onClose()
      router.push(`/invoices/${Math.floor(Math.random() * 1000)}`)
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du fichier",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const simulateOCRProcessing = () => {
    // Simulate OCR processing
    return {
      invoice: {
        supplier: "Fournisseur simulé",
        invoiceNumber: "123456",
        invoiceDate: new Date().toLocaleDateString(),
        amount: 100,
        amountWithTax: 120,
        vatAmount: 20,
        currency: "MAD",
        confidence: 0.8,
      },
      rawText: "Texte extrait simulé",
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
                Suivant
              </Button>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Fichier</Label>
              <Input
                id="file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">JPG, PNG ou PDF. Max 5MB.</p>
            </div>
            <Button onClick={handleOCRProcess} disabled={!file || isLoading}>
              {isLoading ? "Traitement en cours..." : "Traiter le fichier"}
            </Button>
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

