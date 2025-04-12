"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  FileUp,
  Check,
  FileText,
  Save,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Edit,
  Eye,
  Loader2,
  ArrowRight,
  Info,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { ModernFileUploadModal } from "@/components/modern-file-upload-modal"

interface OcrResult {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  supplier: string
  amount: number
  amountWithTax: number
  vatAmount?: number
  currency?: string
  fileUrl?: string
  fileName?: string
  confidence?: number
  rawText?: string
}

export default function OcrUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [zoom, setZoom] = useState(1)
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [highlightedField, setHighlightedField] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedResult, setEditedResult] = useState<OcrResult | null>(null)
  const [confidenceColors, setConfidenceColors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get the current company ID
  useEffect(() => {
    if (typeof window === "undefined") return

    const companyId = localStorage.getItem("selectedCompanyId")
    if (companyId) {
      setCurrentCompanyId(companyId)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Update edited result when OCR result changes
  useEffect(() => {
    if (ocrResult) {
      setEditedResult({ ...ocrResult })
    }
  }, [ocrResult])

  // Generate confidence colors for fields
  useEffect(() => {
    if (ocrResult && ocrResult.confidence) {
      const overallConfidence = ocrResult.confidence

      // Generate random but consistent confidence scores for each field
      const fields = {
        invoiceNumber: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        invoiceDate: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        supplier: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        amount: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        amountWithTax: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        vatAmount: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
      }

      // Generate colors based on confidence
      const colors: Record<string, string> = {}
      Object.entries(fields).forEach(([field, confidence]) => {
        if (confidence > 0.8) {
          colors[field] = "bg-green-100 border-green-300"
        } else if (confidence > 0.5) {
          colors[field] = "bg-yellow-100 border-yellow-300"
        } else {
          colors[field] = "bg-red-100 border-red-300"
        }
      })

      setConfidenceColors(colors)
    }
  }, [ocrResult])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)

      // Create a preview URL for the file
      if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      setError(null)

      // Create a preview URL for the file
      if (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf") {
        const url = URL.createObjectURL(droppedFile)
        setPreviewUrl(url)
      }
    }
  }

  // Extract invoice data from OCR text
  const extractInvoiceData = (ocrText: string): OcrResult => {
    // Basic extraction logic - in a real app, this would be more sophisticated
    const invoiceNumberMatch = ocrText.match(/(?:invoice|facture|inv)[^\d]*(\d+[-\s]?\d+)/i)
    const dateMatch = ocrText.match(/(?:date)[^\d]*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})/i)
    const amountMatch = ocrText.match(/(?:total|amount|montant)[^\d]*(\d+(?:[.,]\d+)?)/i)
    const vatMatch = ocrText.match(/(?:tva|vat|tax)[^\d]*(\d+(?:[.,]\d+)?)/i)
    const supplierMatch = ocrText.match(/(?:from|de|supplier|fournisseur)[^:]*(?::|)\s*([^\n]+)/i)

    // Calculate confidence based on how many fields were extracted
    const extractedFields = [invoiceNumberMatch, dateMatch, amountMatch, supplierMatch].filter(Boolean).length

    const confidence = Math.min(1, extractedFields / 4)

    return {
      invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1].trim() : "",
      invoiceDate: dateMatch ? dateMatch[1].trim() : "",
      supplier: supplierMatch ? supplierMatch[1].trim() : "Unknown Supplier",
      amount: amountMatch ? Number.parseFloat(amountMatch[1].replace(",", ".")) : 0,
      amountWithTax: amountMatch ? Number.parseFloat(amountMatch[1].replace(",", ".")) * 1.2 : 0,
      vatAmount: vatMatch ? Number.parseFloat(vatMatch[1].replace(",", ".")) : 0,
      currency: "MAD", // Default currency
      fileName: file?.name || "",
      fileUrl: previewUrl,
      confidence: confidence,
      rawText: ocrText,
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setProcessingStatus(null)
    setError(null)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(uploadInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      setProcessingStatus("Uploading file...")

      // Send the file to our API route
      setProcessingStatus("Sending to OCR service...")
      setProcessing(true)

      console.log("Sending file to OCR service:", file.name, file.type, file.size)

      const response = await fetch("/api/ocr/process", {
        method: "POST",
        body: formData,
      })

      console.log("OCR API response status:", response.status)

      const responseData = await response.json()
      console.log("OCR API response:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server responded with status: ${response.status}`)
      }

      setProcessingStatus("Processing OCR results...")

      // Extract OCR text from response
      const ocrText = responseData.ocrText || ""

      if (!ocrText) {
        throw new Error("No text was extracted from the document")
      }

      console.log("Extracted OCR text:", ocrText.substring(0, 200) + "...")

      // Parse the OCR text to extract invoice data
      const extractedData = extractInvoiceData(ocrText)
      console.log("Extracted invoice data:", extractedData)

      // Complete the upload
      clearInterval(uploadInterval)
      setUploadProgress(100)
      setProcessingStatus("Processing complete!")
      setOcrResult(extractedData)
      setActiveTab("review")

      toast({
        title: "OCR Processing Complete",
        description: "The document has been successfully processed.",
      })
    } catch (err) {
      clearInterval(uploadInterval)
      console.error("Error processing OCR:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "OCR Processing Failed",
        description: err instanceof Error ? err.message : "Failed to process the document",
      })
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const handleSaveInvoice = () => {
    if (!editedResult || !currentCompanyId) return

    // Get existing invoices
    const existingInvoicesJson = localStorage.getItem(`invoices_${currentCompanyId}`)
    const existingInvoices = existingInvoicesJson ? JSON.parse(existingInvoicesJson) : []

    // Create new invoice object
    const newInvoice = {
      id: Math.random().toString(36).substring(2, 9),
      name: editedResult.supplier,
      invoiceNumber: editedResult.invoiceNumber,
      partner: editedResult.supplier,
      invoiceDate: editedResult.invoiceDate,
      dueDate: editedResult.dueDate || editedResult.invoiceDate,
      createdAt: new Date().toLocaleDateString(),
      amount: editedResult.amount,
      amountWithTax: editedResult.amountWithTax,
      type: "facture",
      paymentStatus: "non-paye",
      declarationStatus: "non-declare",
      status: "en-cours",
      hasWarning: false,
      fileUrl: editedResult.fileUrl,
      fileName: editedResult.fileName,
      ocrConfidence: editedResult.confidence,
      ocrRawText: editedResult.rawText,
    }

    // Add to invoices and save
    const updatedInvoices = [newInvoice, ...existingInvoices]
    localStorage.setItem(`invoices_${currentCompanyId}`, JSON.stringify(updatedInvoices))

    toast({
      title: "Invoice saved",
      description: "The invoice has been successfully saved.",
    })

    // Redirect to invoices page
    router.push("/dashboard/invoices")
  }

  const handleFieldChange = (field: keyof OcrResult, value: any) => {
    if (!editedResult) return
    setEditedResult({
      ...editedResult,
      [field]: value,
    })
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return "High"
    if (confidence > 0.5) return "Medium"
    return "Low"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-500"
    if (confidence > 0.5) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <ErrorBoundary>
      <ModernFileUploadModal {...props} />
    </ErrorBoundary>
  )
}
