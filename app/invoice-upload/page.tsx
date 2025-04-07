"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText, Upload } from "lucide-react"
import { InvoiceUploadForm } from "@/components/invoice-upload-form"

export default function InvoiceUploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (ocrResults: any) => {
    // Store the OCR results in sessionStorage temporarily
    sessionStorage.setItem("ocrResults", JSON.stringify(ocrResults))

    // Navigate to the confirmation page
    router.push("/invoice-upload/confirm")
  }

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage)
    setIsUploading(false)
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Invoice Upload</CardTitle>
          <CardDescription>
            Upload your invoice to automatically extract information using our OCR system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <InvoiceUploadForm
            onUploadStart={() => {
              setIsUploading(true)
              setError(null)
            }}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            isUploading={isUploading}
          />

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-3">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">1. Upload Invoice</h4>
                <p className="text-sm text-muted-foreground">Upload your invoice in PDF or image format (JPG, PNG)</p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">2. Review Data</h4>
                <p className="text-sm text-muted-foreground">
                  Our OCR system extracts key information for you to review
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-medium mb-1">3. Confirm & Save</h4>
                <p className="text-sm text-muted-foreground">
                  Confirm the extracted data and save to your accounting system
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <p>Supported formats: PDF, JPG, PNG</p>
          <p>Maximum file size: 10MB</p>
        </CardFooter>
      </Card>
    </div>
  )
}

