"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Check, AlertCircle, FileText, Edit, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { EnhancedUpload } from "@/components/enhanced-upload"
import { StatusTag } from "@/components/status-tag"

// Sample invoice data structure
interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  vat: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  supplier: string
  items: InvoiceItem[]
  subtotal: number
  vat: number
  total: number
  paymentMethod: string
  fileUrl?: string
  fileName?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)

  // Get the current company ID
  React.useEffect(() => {
    // Only run this code in the browser
    if (typeof window === "undefined") return

    const companyId = localStorage.getItem("selectedCompanyId")
    if (companyId) {
      setCurrentCompanyId(companyId)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  const handleFilesAccepted = (files: File[]) => {
    if (files.length === 0 || !currentCompanyId) return

    const file = files[0] // Take the first file for simplicity
    setFile(file)
    setUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)
    setUploadError(null)
    setProcessingStatus(null)

    // Create a preview URL for the file
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate OCR processing
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setUploadSuccess(true)
      setProcessingStatus("Preparing document for OCR processing...")

      setTimeout(() => {
        setProcessingStatus("Sending document to OCR service...")

        setTimeout(() => {
          setProcessingStatus("Extracting text with OCR...")

          setTimeout(() => {
            setProcessingStatus("Identifying invoice data from OCR results...")

            setTimeout(() => {
              setProcessingStatus("Processing complete!")

              // Create mock OCR result
              const mockOcrResult = {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")}`,
                date: new Date().toLocaleDateString(),
                supplier: file.name.split(".")[0] || "Unknown Supplier",
                amount: Math.floor(Math.random() * 5000) + 500,
                amountWithTax: Math.floor(Math.random() * 5000) + 500 * 1.2,
                fileUrl: previewUrl,
                fileName: file.name,
              }

              // Create invoice items
              const items = [
                {
                  description: "Extracted from invoice",
                  quantity: 1,
                  unitPrice: mockOcrResult.amount,
                  amount: mockOcrResult.amount,
                  vat: mockOcrResult.amountWithTax - mockOcrResult.amount,
                },
              ]

              // Create full invoice data
              const invoiceData = {
                invoiceNumber: mockOcrResult.invoiceNumber,
                date: mockOcrResult.date,
                supplier: mockOcrResult.supplier,
                items: items,
                subtotal: mockOcrResult.amount,
                vat: mockOcrResult.amountWithTax - mockOcrResult.amount,
                total: mockOcrResult.amountWithTax,
                paymentMethod: "Bank Transfer",
                fileUrl: mockOcrResult.fileUrl,
                fileName: mockOcrResult.fileName,
              }

              setExtractedData(invoiceData)
              setActiveTab("review")
              setUploading(false)
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    }, 1500)
  }

  const handleSaveInvoice = () => {
    if (!extractedData || !currentCompanyId) return

    // Get existing invoices
    const existingInvoicesJson = localStorage.getItem(`invoices_${currentCompanyId}`)
    const existingInvoices = existingInvoicesJson ? JSON.parse(existingInvoicesJson) : []

    // Create new invoice object
    const newInvoice = {
      id: Math.random().toString(36).substring(2, 9),
      name: extractedData.supplier,
      invoiceNumber: extractedData.invoiceNumber,
      partner: extractedData.supplier,
      invoiceDate: extractedData.date,
      dueDate: extractedData.date, // In a real app, you might calculate this
      createdAt: new Date().toLocaleDateString(),
      amount: extractedData.subtotal,
      amountWithTax: extractedData.total,
      type: "facture",
      paymentStatus: "non-paye",
      declarationStatus: "non-declare",
      status: "en-cours",
      hasWarning: true,
      fileUrl: extractedData.fileUrl, // Store the file URL
      fileName: extractedData.fileName, // Store the file name
    }

    // Add to invoices and save
    const updatedInvoices = [newInvoice, ...existingInvoices]
    localStorage.setItem(`invoices_${currentCompanyId}`, JSON.stringify(updatedInvoices))

    // Redirect to invoices page
    router.push("/dashboard/invoices")
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Documents</h1>
      <p className="text-muted-foreground">Upload invoices and other financial documents for processing</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="review" disabled={!extractedData}>
            Review
          </TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Invoice</CardTitle>
                <CardDescription>Upload an invoice for OCR processing and data extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EnhancedUpload
                  onFilesAccepted={handleFilesAccepted}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                  acceptedFileTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
                  showPreview={true}
                />

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Upload Progress</Label>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {uploadSuccess && (
                  <Alert variant="success" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>File uploaded successfully.</AlertDescription>
                  </Alert>
                )}

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {processingStatus && (
                  <Alert>
                    <FileUp className="h-4 w-4" />
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
                <CardContent className="flex items-center justify-center p-0 overflow-hidden">
                  {file?.type === "application/pdf" ? (
                    <iframe src={previewUrl} className="w-full h-[400px] border-0" title="PDF Preview" />
                  ) : (
                    <div className="relative w-full h-[400px] flex items-center justify-center bg-muted/20">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {extractedData && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Invoice Details</CardTitle>
                  <CardDescription>Review and edit extracted invoice information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="invoiceNumber"
                          value={extractedData.invoiceNumber}
                          onChange={(e) => setExtractedData({ ...extractedData, invoiceNumber: e.target.value })}
                        />
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="date"
                          value={extractedData.date}
                          onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                        />
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="supplier"
                          value={extractedData.supplier}
                          onChange={(e) => setExtractedData({ ...extractedData, supplier: e.target.value })}
                        />
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtotal">Subtotal</Label>
                      <Input
                        id="subtotal"
                        value={extractedData.subtotal.toFixed(2)}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value)
                          if (!isNaN(value)) {
                            setExtractedData({ ...extractedData, subtotal: value })
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vat">VAT</Label>
                      <Input
                        id="vat"
                        value={extractedData.vat.toFixed(2)}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value)
                          if (!isNaN(value)) {
                            setExtractedData({ ...extractedData, vat: value })
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total">Total</Label>
                      <Input
                        id="total"
                        value={extractedData.total.toFixed(2)}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value)
                          if (!isNaN(value)) {
                            setExtractedData({ ...extractedData, total: value })
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Input
                        id="paymentMethod"
                        value={extractedData.paymentMethod}
                        onChange={(e) => setExtractedData({ ...extractedData, paymentMethod: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back
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
                  <CardDescription>Preview of the uploaded document</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {extractedData.fileUrl && (
                    <div className="relative w-full h-[400px] flex items-center justify-center bg-muted/20">
                      <img
                        src={(extractedData.fileUrl as string) || "/placeholder.svg"}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>Items extracted from the invoice</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.unitPrice.toFixed(2)} DH</TableCell>
                          <TableCell className="text-right">{item.amount.toFixed(2)} DH</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="ml-auto space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Subtotal:</span>
                      <span className="ml-8">{extractedData.subtotal.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">VAT:</span>
                      <span className="ml-8">{extractedData.vat.toFixed(2)} DH</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span className="ml-8">{extractedData.total.toFixed(2)} DH</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>View your recent document uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedData ? (
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>{extractedData.fileName || "Unknown"}</TableCell>
                      <TableCell>{extractedData.supplier}</TableCell>
                      <TableCell>{extractedData.invoiceNumber}</TableCell>
                      <TableCell className="text-right">{extractedData.total.toFixed(2)} DH</TableCell>
                      <TableCell>
                        <StatusTag status="validated" size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setActiveTab("review")}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No upload history available yet. Upload some documents to see them here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
