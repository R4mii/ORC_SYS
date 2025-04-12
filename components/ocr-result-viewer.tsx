"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText } from "lucide-react"

interface OcrResultViewerProps {
  data: any
}

export default function OcrResultViewer({ data }: OcrResultViewerProps) {
  // Process the data to ensure it has the expected structure
  const processedData = processData(data)

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="preview" className="text-sm">
          Aperçu
        </TabsTrigger>
        <TabsTrigger value="data" className="text-sm">
          Données extraites
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="space-y-4 mt-2">
        <div className="border rounded-lg p-5 bg-muted/30">
          <h3 className="font-medium mb-3 text-sm flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Texte extrait
          </h3>
          <div className="max-h-[300px] overflow-y-auto text-sm whitespace-pre-wrap bg-background p-4 rounded-md border">
            {processedData.rawText || "Aucun texte extrait"}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="data" className="space-y-4 mt-2">
        <div className="border rounded-lg p-5">
          <h3 className="font-medium mb-4 text-sm flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Données de la facture
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Fournisseur</p>
              <p className="font-medium">{processedData.invoice.supplier || "Non détecté"}</p>
            </div>
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Numéro de facture</p>
              <p className="font-medium">{processedData.invoice.invoiceNumber || "Non détecté"}</p>
            </div>
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Date de facture</p>
              <p className="font-medium">{processedData.invoice.invoiceDate || "Non détecté"}</p>
            </div>
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Montant HT</p>
              <p className="font-medium">
                {processedData.invoice.amount
                  ? `${processedData.invoice.amount.toFixed(2)} ${processedData.invoice.currency || "MAD"}`
                  : "Non détecté"}
              </p>
            </div>
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">TVA</p>
              <p className="font-medium">
                {processedData.invoice.vatAmount
                  ? `${processedData.invoice.vatAmount.toFixed(2)} ${processedData.invoice.currency || "MAD"}`
                  : "Non détecté"}
              </p>
            </div>
            <div className="space-y-1 bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Montant TTC</p>
              <p className="font-medium">
                {processedData.invoice.amountWithTax
                  ? `${processedData.invoice.amountWithTax.toFixed(2)} ${processedData.invoice.currency || "MAD"}`
                  : "Non détecté"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm p-3 border rounded-lg bg-muted/30">
          <div
            className={`w-2 h-2 rounded-full ${
              processedData.invoice.confidence > 0.7
                ? "bg-green-500"
                : processedData.invoice.confidence > 0.4
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          ></div>
          <span>
            Confiance: {Math.round((processedData.invoice.confidence || 0) * 100)}%
            <span className="ml-1 transition-opacity duration-200">
              (
              {processedData.invoice.confidence > 0.7
                ? "Élevée"
                : processedData.invoice.confidence > 0.4
                  ? "Moyenne"
                  : "Faible"}
              )
            </span>
          </span>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Helper function to ensure data has the expected structure
function processData(data: any) {
  // If data is already in the expected format, return it
  if (data && data.invoice) return data

  // Check if data is an array
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0]

    // Extract output if it exists
    const output = firstItem.output || {}

    // Create a standardized structure
    return {
      rawText: firstItem.text || "",
      invoice: {
        supplier: output.Fournisseur || "",
        invoiceNumber: output["Numéro de facture"] || "",
        invoiceDate: output.date || "",
        amount: Number.parseFloat(output["Montant HT"] || "0"),
        vatAmount: Number.parseFloat(output["Montant TVA"] || "0"),
        amountWithTax: Number.parseFloat(output["Montant TTC"] || "0"),
        currency: "MAD",
        confidence: 0.8, // Default confidence
      },
      originalResponse: data,
    }
  } else if (data && typeof data === "object") {
    // Try to extract data from the object
    return {
      rawText: data.text || "",
      invoice: {
        supplier: data.supplier || "",
        invoiceNumber: data.invoiceNumber || "",
        invoiceDate: data.date || "",
        amount: Number.parseFloat(data.amount || "0"),
        vatAmount: Number.parseFloat(data.vatAmount || "0"),
        amountWithTax: Number.parseFloat(data.total || "0"),
        currency: data.currency || "MAD",
        confidence: data.confidence || 0.5,
      },
      originalResponse: data,
    }
  }

  // Fallback to empty structure
  return {
    rawText: "",
    invoice: {
      supplier: "",
      invoiceNumber: "",
      invoiceDate: "",
      amount: 0,
      vatAmount: 0,
      amountWithTax: 0,
      currency: "MAD",
      confidence: 0,
    },
    originalResponse: data,
  }
}
