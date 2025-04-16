"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileUp, X, FileText, ImageIcon, Upload, ArrowRight, AlertTriangle, Check } from "lucide-react"
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

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Small delay to allow animation to complete
      const timeout = setTimeout(() => {
        setFiles([])
        setProgress(0)
        setCurrentStep("upload")
        setOcrResults(null)
        setError(null)
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [open])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }, [])

  const handleFiles = useCallback((newFiles: File[]) => {
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

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (supportedFiles[0].size > maxSize) {
      setError(`Le fichier est trop volumineux. Taille maximale: 10MB.`)
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 10MB.",
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
  }, [])

  const simulateProgressUpdate = useCallback(() => {
    setProgress(0)

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const increment = prev < 30 ? 5 : prev < 70 ? 2 : 1
        const newProgress = prev + increment

        if (newProgress >= 95) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          return 95
        }

        return newProgress
      })
    }, 200)
  }, [])

  // Update the handleUpload function to use the fallback URL if needed
  // Find the handleUpload function and replace it with this improved version

  // Update the processOcrResponse function to handle the new format
  const processOcrResponse = useCallback((data: any) => {
    // Check if data is an array with the specific format from the example
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      const output = data[0].output

      return {
        rawText: JSON.stringify(data, null, 2),
        ocrOutput: data[0].output, // Store the complete output object
        invoice: {
          supplier: output.Fournisseur || "",
          invoiceNumber: output["Numéro de facture"] || "",
          invoiceDate: output.date || "",
          amount: Number.parseFloat(output["Montant HT"]?.replace(/\./g, "")?.replace(",", ".") || "0"),
          vatAmount: Number.parseFloat(output["Montant TVA"]?.replace(/\./g, "")?.replace(",", ".") || "0"),
          amountWithTax: Number.parseFloat(output["Montant TTC"]?.replace(/\./g, "")?.replace(",", ".") || "0"),
          currency: output.Devise || "MAD",
          confidence: 0.8,
          details: output[" Détail de facture"] || "",
          companyName: output["name of the company"] || "",
          address: output.adresse || "",
        },
        originalResponse: data,
      }
    } else if (data && typeof data === "object") {
      // If it's already in the expected format, return it
      if (data.invoice) return data

      // Otherwise, try to extract data from the object
      return {
        rawText: data.text || "",
        invoice: {
          supplier: data.supplier || "",
          invoiceNumber: data.invoiceNumber || "",
          invoiceDate: data.date || "",
          amount: Number.parseFloat(data.amount?.toString().replace(/\./g, "")?.replace(",", ".") || "0"),
          vatAmount: Number.parseFloat(data.vatAmount?.toString().replace(/\./g, "")?.replace(",", ".") || "0"),
          amountWithTax: Number.parseFloat(data.total?.toString().replace(/\./g, "")?.replace(",", ".") || "0"),
          currency: data.currency || "MAD",
          confidence: data.confidence || 0.5,
        },
        originalResponse: data,
      }
    }

    // Fallback to empty structure
    return {
      rawText: "",
      invoice: {
        supplier: "",
        invoiceNumber: "",
        invoiceDate: "",
        amount: 0,
        vatAmount: 0,
        amountWithTax: 0,
        currency: "MAD",
        confidence: 0,
      },
      originalResponse: data,
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setCurrentStep("processing")
    simulateProgressUpdate()

    try {
      const formData = new FormData()
      formData.append("file", files[0])

      // Try the fallback route directly
      const response = await fetch("/api/ocr-fallback", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR service returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log("OCR API response:", data)

      // Create a file URL for preview
      const fileUrl = URL.createObjectURL(files[0])

      // Process the OCR response
      const processedData = processOcrResponse(data)
      setOcrResults({
        ...processedData,
        fileUrl: fileUrl, // Add the file URL to the results
      })
      setCurrentStep("results")
      setProgress(100)

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
  }, [files, simulateProgressUpdate, processOcrResponse, toast])

  const handleConfirm = useCallback(() => {
    if (ocrResults) {
      console.log("Processing OCR results:", ocrResults) // Debug log

      // Clean up the file URL when confirming to prevent memory leaks
      if (ocrResults.fileUrl) {
        URL.revokeObjectURL(ocrResults.fileUrl)
      }

      const result = {
        ...ocrResults,
        originalFile: {
          name: files[0].name,
          type: files[0].type,
          size: files[0].size,
        },
        documentType: documentType,
      }

      // Call the completion handler
      onUploadComplete(result)
      onClose()
    }
  }, [ocrResults, files, documentType, onUploadComplete, onClose])

  const getDocumentTypeLabel = useCallback(() => {
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
  }, [documentType])

  const getFileTypeIcon = useCallback((file: File) => {
    const fileType = file.type.toLowerCase()
    if (fileType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />
    } else if (fileType.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else {
      return <FileUp className="h-6 w-6 text-gray-500" />
    }
  }, [])

  // Clean up file URL on unmount
  useEffect(() => {
    return () => {
      if (ocrResults?.fileUrl) {
        URL.revokeObjectURL(ocrResults.fileUrl)
      }
    }
  }, [ocrResults])

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
          <DialogDescription className="text-sm text-muted-foreground">
            Téléchargez un document pour extraction automatique des données
          </DialogDescription>
        </DialogHeader>

        {currentStep === "upload" && (
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

        {currentStep === "processing" && (
          <div className="p-6 space-y-8 py-12">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
              </div>
              <h3 className="text-lg font-medium">Traitement OCR en cours</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Veuillez patienter pendant que nous analysons votre document...
              </p>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}%</span>
                <span className="transition-opacity duration-200">
                  {progress < 30 && "Préparation du document..."}
                  {progress >= 30 && progress < 70 && "Analyse OCR en cours..."}
                  {progress >= 70 && "Extraction des données..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentStep === "results" && ocrResults && (
          <div className="p-6 space-y-6">
            <OcrResultViewer data={ocrResults} />

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" onClick={() => setCurrentStep("upload")} className="px-4">
                Retour
              </Button>
              <Button onClick={handleConfirm} className="px-4 gap-2">
                <Check className="h-4 w-4" />
                Confirmer et enregistrer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
