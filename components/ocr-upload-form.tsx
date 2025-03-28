"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, FileText } from "lucide-react"

interface OcrResult {
  success: boolean
  taskDescription: string
  availablePages: number
  processedPages: number
  confidence: number
  invoice: {
    invoiceNumber?: string
    date?: string
    supplier?: string
    totalAmount?: string
    subtotal?: string
    vatAmount?: string
    currency?: string
  }
  rawText: string
}

export default function OcrUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to our API route
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      // Parse the JSON response
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status: ${response.status}`)
      }

      // Complete the upload
      clearInterval(progressInterval)
      setUploadProgress(100)
      setResult(data)
    } catch (err) {
      clearInterval(progressInterval)
      console.error("Error processing OCR:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OCR Document Upload</CardTitle>
          <CardDescription>Upload an invoice or document for OCR processing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" disabled={uploading} />
              <p className="text-sm text-muted-foreground">Supported formats: PDF, JPG, PNG (max 10MB)</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Upload Progress</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" disabled={!file || uploading} className="w-full">
              {uploading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Process Document
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>OCR Results</CardTitle>
            <CardDescription>
              Processed {result.processedPages} of {result.availablePages} pages with{" "}
              {Math.round(result.confidence * 100)}% confidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Invoice Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Invoice Number:</span>
                    <span className="text-sm font-medium">{result.invoice.invoiceNumber || "Not detected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">{result.invoice.date || "Not detected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Supplier:</span>
                    <span className="text-sm font-medium">{result.invoice.supplier || "Not detected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="text-sm font-medium">
                      {result.invoice.totalAmount
                        ? `${result.invoice.totalAmount} ${result.invoice.currency || ""}`
                        : "Not detected"}
                    </span>
                  </div>
                  {result.invoice.subtotal && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="text-sm font-medium">
                        {result.invoice.subtotal} {result.invoice.currency || ""}
                      </span>
                    </div>
                  )}
                  {result.invoice.vatAmount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">VAT Amount:</span>
                      <span className="text-sm font-medium">
                        {result.invoice.vatAmount} {result.invoice.currency || ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Raw Text</h3>
                <div className="bg-muted p-3 rounded-md text-xs font-mono h-40 overflow-auto">{result.rawText}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Task: {result.taskDescription}</p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

