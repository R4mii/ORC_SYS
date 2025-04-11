"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUp, X, FileText, ImageIcon, Upload, ArrowRight, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FadeIn, ScaleIn } from "@/components/ui/motion"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import OcrResultViewer from "@/components/ocr-result-viewer"

type DocumentType = "purchases" | "sales" | "cashReceipts" | "bankStatements"

interface ModernFileUploadModalProps {
  open: boolean
  onClose: () => void
  documentType: DocumentType
  onUploadComplete: (data: any) => void
}

export function ModernFileUploadModal({ open, onClose, documentType, onUploadComplete }: ModernFileUploadModalProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "results">("upload")
  const [ocrResults, setOcrResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

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
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner des fichiers PDF ou images (JPG, PNG)",
        variant: "destructive",
      })
      return
    }

    setFiles(supportedFiles)
    setError(null)

    toast({
      title: "Fichier ajouté",
      description: `${supportedFiles[0].name} est prêt à être traité`,
      variant: "default",
    })
  }

  const simulateProgressUpdate = () => {
    setProgress(0)

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = prev < 30 ? 5 : prev < 70 ? 2 : 1
        const newProgress = prev + increment

        if (newProgress >= 95) {
          clearInterval(progressIntervalRef.current!)
          return 95
        }

        return newProgress
      })
    }, 200)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setCurrentStep("processing")
    simulateProgressUpdate()

    try {
      const formData = new FormData()
      formData.append("invoice1", files[0])

      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Sending form data to OCR service")
      const response = await fetch("https://n8n-0ku3a-u40684.vm.elestio.app/webhook/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR service returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log("OCR API response:", data)

      setProgress(100)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      // Set the raw API response as the OCR results
      setOcrResults(data)
      setCurrentStep("results")

      toast({
        title: "Traitement OCR terminé",
        description: "Les données ont été extraites avec succès",
        variant: "default",
      })
    } catch (err) {
      console.error("OCR Error:", err)
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors du traitement OCR")
      setCurrentStep("upload")

      toast({
        title: "Erreur de traitement",
        description: err instanceof Error ? err.message : "Une erreur s'est produite lors du traitement OCR",
        variant: "destructive",
      })

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    } finally {
      setIsUploading(false)
    }
  }

  function extractInvoiceData(text: string) {
    const invoice: Record<string, any> = {}

    const invoiceNumberMatch =
      text.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*(\d+[-\s]?\d+)/i) ||
      text.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*([A-Z0-9][-A-Z0-9/]+)/i)
    if (invoiceNumberMatch) {
      invoice.invoiceNumber = invoiceNumberMatch[1].trim()
    }

    const dateMatch =
      text.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i) || text.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    if (dateMatch) {
      invoice.invoiceDate = dateMatch[1].trim()
    }

    const supplierMatch =
      text.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^
    ]+)/i) ||
      text.match(/(?:société|company|raison sociale)[^:]*(?::|)\s*([^
]+)/i)
    if (supplierMatch) {
      invoice.supplier = supplierMatch[1].trim()
    } else {
      const lines = text.split("
").slice(0, 5)
      for (const line of lines) {
        if (/^[A-Z\s]{5,}$/.test(line) || /\b(?:SARL|SA|SAS|EURL|SASU)\b/.test(line)) {
          invoice.supplier = line.trim()
          break
        }
      }
    }

    const totalMatch =
      text.match(/(?:total\s*ttc|montant\s*total|total\s*amount)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      text.match(/(?:total)[^0-9€$]*([0-9\s,.]+)[€$\s]*(?:dh|mad|dirham)/i) ||
      text.match(/(?:à\s*payer|to\s*pay)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (totalMatch) {
      const cleanNumber = totalMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.amountWithTax = cleanNumber
    }

    const subtotalMatch =
      text.match(/(?:sous\s*total|subtotal|total\s*ht|montant\s*ht)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      text.match(/(?:ht|hors\s*taxe)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (subtotalMatch) {
      const cleanNumber = subtotalMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.amount = cleanNumber
    }

    const vatMatch =
      text.match(/(?:tva|t\.v\.a\.|vat)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      text.match(/(?:montant\s*(?:tva|t\.v\.a\.|vat))[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (vatMatch) {
      const cleanNumber = vatMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.vatAmount = cleanNumber
    }

    const currencyMatch = text.match(/(?:€|\$|£|MAD|DH|DHs|EUR|USD|GBP)/i)
    if (currencyMatch) {
      const currencyMap: Record<string, string> = {
        "€": "EUR",
        $: "USD",
        "£": "GBP",
        MAD: "MAD",
        DH: "MAD",
        DHs: "MAD",
        EUR: "EUR",
        USD: "USD",
        GBP: "GBP",
      }
      invoice.currency = currencyMap[currencyMatch[0].toUpperCase()] || "MAD"
    } else {
      invoice.currency = "MAD"
    }

    return invoice
  }

  const handleConfirm = () => {
    if (ocrResults) {
      const result = {
        ...ocrResults,
        originalFile: {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        },
        documentType: documentType,
      }

      onUploadComplete(result)
      onClose()
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

  const getFileTypeIcon = (file: File) => {
    const fileType = file.type.toLowerCase()
    if (fileType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else if (fileType.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else {
      return <FileUp className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Badge variant="outline" className="font-normal text-xs py-0">
              {getDocumentTypeLabel()}
            </Badge>
            Charger un document
          </DialogTitle>
        </DialogHeader>

        {currentStep === "results" && ocrResults ? (
          <div className="p-6">
            {/* Add key prop to force re-render when data changes */}
            <OcrResultViewer key={JSON.stringify(ocrResults)} data={ocrResults} onSave={handleConfirm} />

            {/* Add user-friendly error message if parsing fails */}
            <div className="mt-4 flex justify-end">
              <Button onClick={handleConfirm}>Confirm and Save</Button>
            </div>
          </div>
        ) : (
          <FadeIn className="p-6 space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.98]"
                  : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ScaleIn>
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Glissez-déposez votre fichier ici</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ou{" "}
                  <button
                    className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    parcourez vos fichiers
                  </button>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">Formats supportés: PDF, JPG, PNG</p>
              </ScaleIn>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                aria-label="Sélectionner un fichier"
              />
            </div>

            {files.length > 0 && (
              <ScaleIn>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-background rounded-md flex items-center justify-center border">
                        {getFileTypeIcon(files[0])}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{files[0].name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(files[0].size / 1024 / 1024).toFixed(2)} MB • Ajouté {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFiles([])}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                      aria-label="Supprimer le fichier"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </ScaleIn>
            )}

            {error && (
              <FadeIn>
                <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </FadeIn>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={onClose} className="px-4">
                Annuler
              </Button>
              <Button onClick={handleUpload} disabled={files.length === 0 || isUploading} className="px-4 gap-2">
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </FadeIn>
        )}
      </DialogContent>
    </Dialog>
  )
}
