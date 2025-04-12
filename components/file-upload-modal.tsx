"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FileUploadModalProps {
  open: boolean
  onClose: () => void
  documentType: string
  onUploadComplete: (result: any) => void
}

export function FileUploadModal({ open, onClose, documentType, onUploadComplete }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0] || null
    setFile(droppedFile)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", documentType)

      // Simulate OCR processing with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a mock OCR result
      const mockOcrResult = {
        originalFile: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        invoice: {
          supplier: "Fournisseur Exemple",
          invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")}`,
          invoiceDate: new Date().toLocaleDateString(),
          amount: Math.floor(Math.random() * 10000),
          amountWithTax: Math.floor(Math.random() * 12000),
          vatAmount: Math.floor(Math.random() * 2000),
          confidence: 0.85,
        },
        rawText: `FACTURE
Fournisseur Exemple
Date: ${new Date().toLocaleDateString()}
Montant HT: ${Math.floor(Math.random() * 10000)} DH
TVA: ${Math.floor(Math.random() * 2000)} DH
Montant TTC: ${Math.floor(Math.random() * 12000)} DH`,
      }

      // Call the onUploadComplete callback with the OCR result
      onUploadComplete(mockOcrResult)

      // Reset the state
      setFile(null)
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Une erreur s'est produite lors du téléchargement du fichier")
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const documentTypeLabels: Record<string, string> = {
    purchases: "Achats",
    sales: "Ventes",
    cashReceipts: "Bons de caisse",
    bankStatements: "Relevés bancaires",
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Charger un document - {documentTypeLabels[documentType] || documentType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Glissez-déposez votre fichier ici ou cliquez pour parcourir</p>
              <p className="text-xs text-muted-foreground">Formats supportés: PDF, PNG, JPG (max 10MB)</p>
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm bg-muted p-2 rounded-md w-full">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Charger"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
