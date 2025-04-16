"use client"

import { useEffect } from "react"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileUp,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Building,
  Calendar,
  Receipt,
  DollarSign,
  ClipboardList,
} from "lucide-react"

interface InvoiceData {
  Fournisseur?: string
  date?: string
  "name of the company"?: string
  adresse?: string
  "Numéro de facture"?: string
  "Montant HT"?: string
  "Montant TVA"?: string
  "Montant TTC"?: string
  "Détail de facture"?: string
}

export function OcrInvoiceProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<InvoiceData | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

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
      handleFileSelection(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }, [])

  const handleFileSelection = useCallback((selectedFile: File) => {
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

    if (selectedFile.size > maxFileSize) {
      setError("File is too large. Maximum size is 10MB.")
      return
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload a PDF or image (JPG, PNG).")
      return
    }

    setFile(selectedFile)
    setError(null)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const simulateProgressUpdate = useCallback(() => {
    setProgress(0)

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Create a new interval that updates progress
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.floor(Math.random() * 5) + 1
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

  function extractInvoiceData(data: any): InvoiceData | null {
    console.log("Processing data:", data) // Debug log

    // Check if data is already in the correct format
    if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
      const output = data[0].output
      return {
        Fournisseur: output.Fournisseur || "",
        date: output.date || "",
        "name of the company": output["name of the company"] || "",
        adresse: output.adresse || "",
        "Numéro de facture": output["Numéro de facture"] || "",
        "Montant HT": output["Montant HT"] || "",
        "Montant TVA": output["Montant TVA"] || "",
        "Montant TTC": output["Montant TTC"] || "",
        "Détail de facture": output[" Détail de facture"] || "", // Note the space in key
      }
    }

    console.error("Invalid OCR data format:", data)
    return null
  }

  const processInvoice = useCallback(async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    simulateProgressUpdate()

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Use the API route instead of direct n8n endpoint
      const response = await fetch("/api/ocr/process", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("OCR Response:", data)

      // Complete the progress
      setProgress(100)

      // Clear the interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      const extractedData = extractInvoiceData(data)
      if (extractedData) {
        setResult(extractedData)
        setActiveTab("result")
      } else {
        throw new Error("Failed to extract invoice data from the response.")
      }
    } catch (err) {
      console.error("Processing error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during processing")
      setActiveTab("upload")
    } finally {
      setIsProcessing(false)
    }
  }, [file, simulateProgressUpdate])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          OCR Invoice Processor
        </CardTitle>
        <CardDescription>Upload an invoice to automatically extract information using OCR technology</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="result" disabled={!result}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!file && !isProcessing && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
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
                <p className="text-xs text-muted-foreground mt-4">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            )}

            {file && !isProcessing && (
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
                  <Button onClick={processInvoice} className="w-full">
                    Process Invoice
                  </Button>
                </div>
              </div>
            )}

            {isProcessing && (
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
          </TabsContent>

          <TabsContent value="result">
            {result && (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Invoice processed successfully. Here are the extracted details.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Building className="h-4 w-4 mr-2 text-primary" />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium whitespace-pre-line">{result.Fournisseur || "Not detected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Company Name</p>
                        <p className="font-medium">{result["name of the company"] || "Not detected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{result.adresse || "Not detected"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        Invoice Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Number</p>
                        <p className="font-medium">{result["Numéro de facture"] || "Not detected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{result.date || "Not detected"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          {result.date || "No date"}
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Receipt className="h-3 w-3 mr-1" />
                          {result["Numéro de facture"] || "No invoice number"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount (Excl. Tax)</p>
                        <p className="font-medium">{result["Montant HT"] || "Not detected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">VAT Amount</p>
                        <p className="font-medium">{result["Montant TVA"] || "Not detected"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount (Incl. Tax)</p>
                        <p className="font-medium">{result["Montant TTC"] || "Not detected"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 text-primary" />
                        Invoice Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Details</p>
                      <div className="bg-muted/30 p-3 rounded-md">
                        <p className="whitespace-pre-line text-sm">
                          {result["Détail de facture"] || "No details available"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Process Another Invoice
                  </Button>
                  <Button>Save to System</Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">Powered by n8n OCR Processing</p>
        <p className="text-sm text-muted-foreground">v1.0.0</p>
      </CardFooter>
    </Card>
  )
}
