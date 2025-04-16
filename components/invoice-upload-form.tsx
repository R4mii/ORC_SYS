"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileUp, X, UploadCloud } from "lucide-react"

interface InvoiceUploadFormProps {
  onUploadStart: () => void
  onUploadComplete: (ocrResults: any) => void
  onUploadError: (error: string) => void
  isUploading: boolean
}

export function InvoiceUploadForm({
  onUploadStart,
  onUploadComplete,
  onUploadError,
  isUploading,
}: InvoiceUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
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
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

    if (selectedFile.size > maxFileSize) {
      onUploadError("File is too large. Maximum size is 10MB.")
      return
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      onUploadError("Invalid file type. Please upload a PDF or image (JPG, PNG).")
      return
    }

    setFile(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const submitToOCR = async () => {
    if (!file) return

    onUploadStart()
    setProgress(10)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Use our dedicated API route instead of directly accessing the webhook URL
      const response = await fetch("/api/ocr-webhook", {
        method: "POST",
        body: formData,
      })

      setProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const data = await response.json()
      setProgress(100)

      // Process the OCR results
      const ocrResults = {
        rawText: data.text || data.ocrText || data.result || "",
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        extractedData: extractInvoiceData(data.text || data.ocrText || data.result || ""),
        originalResponse: data,
      }

      // Call the completion handler with OCR results
      onUploadComplete(ocrResults)
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  // Function to extract structured data from OCR text
  const extractInvoiceData = (ocrText: string) => {
    const invoice: Record<string, any> = {}

    // Extract invoice number
    const invoiceNumberMatch =
      ocrText.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*(\d+[-\s]?\d+)/i) ||
      ocrText.match(/(?:invoice|facture|inv)[^\d]*(?:n[o°]?)?[^\d]*([A-Z0-9][-A-Z0-9/]+)/i)
    if (invoiceNumberMatch) {
      invoice.invoiceNumber = invoiceNumberMatch[1].trim()
    }

    // Extract invoice date
    const dateMatch =
      ocrText.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i) ||
      ocrText.match(/(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    if (dateMatch) {
      invoice.date = dateMatch[1].trim()
    }

    // Extract supplier name
    const supplierMatch =
      ocrText.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^\n]+)/i) ||
      ocrText.match(/(?:société|company|raison sociale)[^:]*(?::|)\s*([^\n]+)/i)
    if (supplierMatch) {
      invoice.supplier = supplierMatch[1].trim()
    } else {
      // If no supplier found, try to extract from the top of the document
      const lines = ocrText.split("\n").slice(0, 5) // Check first 5 lines
      for (const line of lines) {
        // Look for a line that might be a company name (all caps, or contains SARL, SA, etc.)
        if (/^[A-Z\s]{5,}$/.test(line) || /\b(?:SARL|SA|SAS|EURL|SASU)\b/.test(line)) {
          invoice.supplier = line.trim()
          break
        }
      }
    }

    // Extract total amount
    const totalMatch =
      ocrText.match(/(?:total\s*ttc|montant\s*total|total\s*amount)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      ocrText.match(/(?:total)[^0-9€$]*([0-9\s,.]+)[€$\s]*(?:dh|mad|dirham)/i) ||
      ocrText.match(/(?:à\s*payer|to\s*pay)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (totalMatch) {
      // Clean up the number: remove spaces, replace comma with dot
      const cleanNumber = totalMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.totalAmount = cleanNumber
    }

    // Extract subtotal (amount without tax)
    const subtotalMatch =
      ocrText.match(/(?:sous\s*total|subtotal|total\s*ht|montant\s*ht)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      ocrText.match(/(?:ht|hors\s*taxe)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (subtotalMatch) {
      const cleanNumber = subtotalMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.subtotal = cleanNumber
    }

    // Extract VAT amount
    const vatMatch =
      ocrText.match(/(?:tva|t\.v\.a\.|vat)[^0-9€$]*([0-9\s,.]+)[€$\s]*/i) ||
      ocrText.match(/(?:montant\s*(?:tva|t\.v\.a\.|vat))[^0-9€$]*([0-9\s,.]+)[€$\s]*/i)
    if (vatMatch) {
      const cleanNumber = vatMatch[1].replace(/\s/g, "").replace(",", ".")
      invoice.vatAmount = cleanNumber
    }

    // Extract currency
    const currencyMatch = ocrText.match(/(?:€|\$|£|MAD|DH|DHs|EUR|USD|GBP)/i)
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
      invoice.currency = "MAD" // Default currency
    }

    return invoice
  }

  return (
    <div className="space-y-4">
      {!file && !isUploading && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Drag and drop your invoice here</h3>
          <p className="text-sm text-muted-foreground mt-2">
            or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline focus:outline-none"
            >
              browse your files
            </button>
          </p>
          <input
            type="file"
            id="invoice1"
            name="invoice1"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      )}

      {file && !isUploading && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <Button onClick={submitToOCR} className="w-full">
              Process Invoice
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="border rounded-lg p-6 bg-muted/30">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            </div>
            <h3 className="text-center font-medium">Processing your invoice...</h3>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 30 && "Uploading file..."}
              {progress >= 30 && progress < 70 && "OCR processing in progress..."}
              {progress >= 70 && "Extracting data..."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
