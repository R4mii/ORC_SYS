"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, ReceiptText, FileText, CalendarIcon, Building, DollarSign, ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface InvoiceData {
  supplier?: string
  invoiceNumber?: string
  date?: string
  subtotal?: string
  vatAmount?: string
  totalAmount?: string
  currency?: string
}

export default function ConfirmationPage() {
  const router = useRouter()
  const [ocrResults, setOcrResults] = useState<any | null>(null)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve OCR results from sessionStorage
    const storedResults = sessionStorage.getItem("ocrResults")

    if (!storedResults) {
      router.push("/invoice-upload")
      return
    }

    try {
      const parsedResults = JSON.parse(storedResults)
      setOcrResults(parsedResults)

      // Initialize form data with extracted data
      if (parsedResults.extractedData) {
        setInvoiceData({
          supplier: parsedResults.extractedData.supplier || "",
          invoiceNumber: parsedResults.extractedData.invoiceNumber || "",
          date: parsedResults.extractedData.date || "",
          subtotal: parsedResults.extractedData.subtotal || "",
          vatAmount: parsedResults.extractedData.vatAmount || "",
          totalAmount: parsedResults.extractedData.totalAmount || "",
          currency: parsedResults.extractedData.currency || "MAD",
        })
      }
    } catch (err) {
      console.error("Error parsing OCR results:", err)
      setError("Failed to load OCR results. Please try again.")
    }
  }, [router])

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // In a real implementation, this would send the data to your accounting system API
      // For this demo, we'll simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create the complete record that would be sent to the accounting system
      const invoiceRecord = {
        ...invoiceData,
        rawText: ocrResults?.rawText,
        fileName: ocrResults?.fileName,
        fileType: ocrResults?.fileType,
        fileSize: ocrResults?.fileSize,
        uploadDate: ocrResults?.uploadDate,
        processingDate: new Date().toISOString(),
        status: "pending_approval",
        accountingReference: `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
      }

      // In a real implementation:
      // const response = await fetch('/api/accounting/invoices', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(invoiceRecord),
      // })
      // if (!response.ok) throw new Error('Failed to save invoice data')

      console.log("Invoice saved:", invoiceRecord)

      // Show success message
      setSuccess("Invoice data has been successfully saved to the accounting system.")

      // Clear session storage to prevent revisiting with stale data
      sessionStorage.removeItem("ocrResults")

      // In a real app, you might redirect to a success page or invoice list
      // router.push('/invoices')
    } catch (err) {
      console.error("Error saving invoice:", err)
      setError(err instanceof Error ? err.message : "Failed to save invoice data. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!ocrResults) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Review Invoice Data</CardTitle>
              <CardDescription>Review and edit the extracted invoice information before saving</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push("/invoice-upload")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 text-green-800 bg-green-50">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="form">
            <TabsList className="mb-6">
              <TabsTrigger value="form">Form View</TabsTrigger>
              <TabsTrigger value="ocr">OCR Text</TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="supplier">Supplier</Label>
                  </div>
                  <Input
                    id="supplier"
                    value={invoiceData.supplier || ""}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ReceiptText className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  </div>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber || ""}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    placeholder="Invoice number"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="date">Invoice Date</Label>
                  </div>
                  <Input
                    id="date"
                    value={invoiceData.date || ""}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    placeholder="Invoice date (DD/MM/YYYY)"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="currency">Currency</Label>
                  </div>
                  <Input
                    id="currency"
                    value={invoiceData.currency || ""}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    placeholder="Currency (e.g., MAD, EUR, USD)"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="subtotal">Subtotal (Amount without tax)</Label>
                  </div>
                  <Input
                    id="subtotal"
                    value={invoiceData.subtotal || ""}
                    onChange={(e) => handleInputChange("subtotal", e.target.value)}
                    placeholder="Subtotal amount"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="vatAmount">VAT Amount</Label>
                  </div>
                  <Input
                    id="vatAmount"
                    value={invoiceData.vatAmount || ""}
                    onChange={(e) => handleInputChange("vatAmount", e.target.value)}
                    placeholder="VAT amount"
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="totalAmount">Total Amount</Label>
                  </div>
                  <Input
                    id="totalAmount"
                    value={invoiceData.totalAmount || ""}
                    onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                    placeholder="Total amount"
                    className="font-medium"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-base font-medium">File Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground mb-1">File Name</p>
                    <p className="font-medium truncate">{ocrResults.fileName}</p>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground mb-1">File Type</p>
                    <p className="font-medium">{ocrResults.fileType}</p>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="text-muted-foreground mb-1">File Size</p>
                    <p className="font-medium">{(ocrResults.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ocr">
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/30">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Extracted OCR Text
                  </h3>
                  <Separator className="my-2" />
                  <div className="max-h-[400px] overflow-y-auto bg-background p-4 rounded-md border whitespace-pre-wrap text-sm font-mono">
                    {ocrResults.rawText || "No OCR text was extracted"}
                  </div>
                </div>

                <Alert variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>OCR Confidence</AlertTitle>
                  <AlertDescription>
                    The confidence level for this extraction is moderate. Please review the extracted information
                    carefully.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/invoice-upload")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !!success} className="gap-2">
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save to Accounting System
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

