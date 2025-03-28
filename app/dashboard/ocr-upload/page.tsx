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
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

      // Create a preview URL for the file
      if (droppedFile.type.startsWith("image/") || droppedFile.type === "application/pdf") {
        const url = URL.createObjectURL(droppedFile)
        setPreviewUrl(url)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setProcessingStatus(null)

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

      // In a real implementation, you would send the file to your OCR API
      // For demo purposes, we'll simulate the API call
      setProcessingStatus("Uploading file...")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setProcessingStatus("Preparing document for OCR processing...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setProcessingStatus("Extracting text with OCR...")
      setProcessing(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      setProcessingStatus("Analyzing invoice data...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate OCR result
      const mockOcrResult: OcrResult = {
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        invoiceDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        supplier: file.name.split(".")[0] || "WANA CORPORATE",
        amount: Math.floor(Math.random() * 5000) + 500,
        amountWithTax: Math.floor(Math.random() * 5000 + 500) * 1.2,
        vatAmount: Math.floor(Math.random() * 5000 + 500) * 0.2,
        currency: "MAD",
        fileUrl: previewUrl,
        fileName: file.name,
        confidence: 0.75 + Math.random() * 0.2,
        rawText:
          "FACTURE\nN° INV-2345\nDate: 15/03/2024\nFournisseur: WANA CORPORATE\nMontant HT: 3450.75 MAD\nTVA (20%): 690.15 MAD\nMontant TTC: 4140.90 MAD",
      }

      // Complete the upload
      clearInterval(uploadInterval)
      setUploadProgress(100)
      setProcessingStatus("Processing complete!")
      setOcrResult(mockOcrResult)
      setActiveTab("review")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">OCR Invoice Processing</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={!ocrResult}>
            Review & Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Invoice</CardTitle>
                <CardDescription>Upload an invoice for OCR processing and data extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    file ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  } cursor-pointer hover:bg-muted/50`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">{file ? file.name : "Drag and drop your invoice here"}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse your files"}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>Accepted file types: PDF, JPG, PNG</p>
                      <p>Maximum file size: 10MB</p>
                    </div>
                  </div>
                </div>

                {file && (
                  <Button className="w-full" onClick={handleUpload} disabled={uploading || processing}>
                    {uploading || processing ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {processing ? "Processing..." : "Uploading..."}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Process Invoice
                      </span>
                    )}
                  </Button>
                )}

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Upload Progress</Label>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {processingStatus && (
                  <Alert>
                    <RotateCw className={`h-4 w-4 ${processing ? "animate-spin" : ""}`} />
                    <AlertTitle>Processing</AlertTitle>
                    <AlertDescription>{processingStatus}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {previewUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>Preview of the uploaded document</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <div className="flex items-center justify-between bg-muted p-2">
                    <div className="text-sm">Preview</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <select
                        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={`${Math.round(zoom * 100)}%`}
                        onChange={(e) => setZoom(Number.parseInt(e.target.value) / 100)}
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
                        onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="h-[400px] bg-gray-100 flex items-center justify-center overflow-auto">
                    <div
                      style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}
                    >
                      {file?.type === "application/pdf" ? (
                        <iframe src={previewUrl} className="w-full h-[400px] border-0" title="PDF Preview" />
                      ) : (
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Document preview"
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {ocrResult && editedResult && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>OCR Results</CardTitle>
                    <CardDescription>Review and edit extracted invoice information</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`h-3 w-3 rounded-full ${getConfidenceColor(ocrResult.confidence || 0)}`}
                            ></div>
                            <span className="text-sm">
                              {ocrResult.confidence ? Math.round(ocrResult.confidence * 100) : 0}% confidence
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Overall OCR confidence score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                      {editMode ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          View Mode
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Mode
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.invoiceNumber}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("invoiceNumber")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <Input
                          id="invoiceNumber"
                          value={editedResult.invoiceNumber}
                          onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.invoiceNumber : ""}
                        />
                        {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="invoiceDate">Invoice Date</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.invoiceDate}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("invoiceDate")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <Input
                          id="invoiceDate"
                          value={editedResult.invoiceDate}
                          onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.invoiceDate : ""}
                        />
                        {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="dueDate">Due Date</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="bg-yellow-100 border-yellow-300">
                                  Medium
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="dueDate"
                          value={editedResult.dueDate || ""}
                          onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? "bg-yellow-100 border-yellow-300" : ""}
                        />
                        {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="supplier">Supplier</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.supplier}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("supplier")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <Input
                          id="supplier"
                          value={editedResult.supplier}
                          onChange={(e) => handleFieldChange("supplier", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.supplier : ""}
                        />
                        {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amount">Amount (Excl. Tax)</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.amount}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("amount")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <div className="flex">
                          <Input
                            id="amount"
                            value={editedResult.amount}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value) || 0
                              handleFieldChange("amount", value)
                            }}
                            readOnly={!editMode}
                            className={!editMode ? confidenceColors.amount : ""}
                            type="number"
                            step="0.01"
                          />
                          <div className="flex items-center ml-2">
                            <span>{editedResult.currency || "MAD"}</span>
                          </div>
                        </div>
                        {editMode && <Edit className="h-4 w-4 absolute right-16 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="vatAmount">VAT Amount</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.vatAmount}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("vatAmount")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <div className="flex">
                          <Input
                            id="vatAmount"
                            value={editedResult.vatAmount || 0}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value) || 0
                              handleFieldChange("vatAmount", value)
                            }}
                            readOnly={!editMode}
                            className={!editMode ? confidenceColors.vatAmount : ""}
                            type="number"
                            step="0.01"
                          />
                          <div className="flex items-center ml-2">
                            <span>{editedResult.currency || "MAD"}</span>
                          </div>
                        </div>
                        {editMode && <Edit className="h-4 w-4 absolute right-16 top-3 text-muted-foreground" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="amountWithTax">Total Amount (Incl. Tax)</Label>
                        {!editMode && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={confidenceColors.amountWithTax}>
                                  {getConfidenceLabel(ocrResult.confidence || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Confidence level for this field</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div
                        className="relative"
                        onMouseEnter={() => setHighlightedField("amountWithTax")}
                        onMouseLeave={() => setHighlightedField(null)}
                      >
                        <div className="flex">
                          <Input
                            id="amountWithTax"
                            value={editedResult.amountWithTax}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value) || 0
                              handleFieldChange("amountWithTax", value)
                            }}
                            readOnly={!editMode}
                            className={!editMode ? confidenceColors.amountWithTax : ""}
                            type="number"
                            step="0.01"
                          />
                          <div className="flex items-center ml-2">
                            <span>{editedResult.currency || "MAD"}</span>
                          </div>
                        </div>
                        {editMode && <Edit className="h-4 w-4 absolute right-16 top-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back to Upload
                  </Button>
                  <Button onClick={handleSaveInvoice}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>Original document with detected fields</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <div className="flex items-center justify-between bg-muted p-2">
                    <div className="text-sm">Preview</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <select
                        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={`${Math.round(zoom * 100)}%`}
                        onChange={(e) => setZoom(Number.parseInt(e.target.value) / 100)}
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
                        onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-[500px] bg-gray-100 flex items-center justify-center overflow-auto">
                    <div
                      style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}
                      className="relative"
                    >
                      {previewUrl && (
                        <>
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="Document preview"
                            className="max-w-full max-h-[500px] object-contain"
                          />

                          {/* Highlight detected fields on hover */}
                          {highlightedField === "invoiceNumber" && (
                            <div className="absolute top-[15%] left-[20%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">Invoice Number</div>
                            </div>
                          )}

                          {highlightedField === "invoiceDate" && (
                            <div className="absolute top-[20%] left-[60%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">Invoice Date</div>
                            </div>
                          )}

                          {highlightedField === "supplier" && (
                            <div className="absolute top-[10%] left-[40%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">Supplier</div>
                            </div>
                          )}

                          {highlightedField === "amount" && (
                            <div className="absolute top-[60%] left-[30%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">Amount (Excl. Tax)</div>
                            </div>
                          )}

                          {highlightedField === "vatAmount" && (
                            <div className="absolute top-[65%] left-[30%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">VAT Amount</div>
                            </div>
                          )}

                          {highlightedField === "amountWithTax" && (
                            <div className="absolute top-[70%] left-[30%] border-2 border-primary bg-primary/10 p-2 rounded">
                              <div className="text-xs font-bold text-primary">Total Amount</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Extracted Raw Text</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Raw text extracted from the document by OCR</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-xs font-mono h-24 overflow-auto">
                      {ocrResult.rawText || "No raw text available"}
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>What happens after saving this invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Save to Your System</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The invoice will be saved to your system with all the extracted data.
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">View in Invoices</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You'll be redirected to your invoices list where you can see all your documents.
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Edit className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Further Editing</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You can always edit the invoice details later from the invoices section.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

