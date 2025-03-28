"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { EnhancedUpload } from "@/components/enhanced-upload"

interface FileUploadModalProps {
  open: boolean
  onClose: () => void
  documentType: string
  onUploadComplete: (result: any) => void
}

export function FileUploadModal({ open, onClose, documentType, onUploadComplete }: FileUploadModalProps) {
  const [uploading, setUploading] = useState(false)

  const handleFilesAccepted = (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)

    // Simulate OCR processing
    setTimeout(() => {
      setUploading(false)

      // Create mock OCR result
      const mockOcrResult = {
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        date: new Date().toLocaleDateString(),
        supplier: files[0].name.split(".")[0] || "Unknown Supplier",
        amount: Math.floor(Math.random() * 5000) + 500,
        amountWithTax: Math.floor(Math.random() * 5000) + 500 * 1.2,
        originalFile: {
          name: files[0].name,
        },
        confidence: 0.8,
        rawText: "Extracted text from OCR",
      }

      onUploadComplete(mockOcrResult)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {documentType}</DialogTitle>
          <DialogDescription>Upload a document for OCR processing</DialogDescription>
        </DialogHeader>
        <EnhancedUpload onFilesAccepted={handleFilesAccepted} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

