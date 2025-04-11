"use client"

import { CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

interface OcrResultViewerProps {
  data: any
  isProcessing?: boolean
  processingProgress?: number
  onSave?: (data: any) => void
}

export function OcrResultViewer({ data, isProcessing, processingProgress, onSave }: OcrResultViewerProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<any>(null)
  const [rawText, setRawText] = useState<string>("")

  useEffect(() => {
    console.log("Data received in OcrResultViewer:", data)

    try {
      if (data) {
        // Extract the raw text
        let extractedRawText = ""
        if (data.rawText) {
          // Direct rawText field
          extractedRawText = data.rawText
        } else if (Array.isArray(data) && data[0]?.output) {
          // Array format with output object
          extractedRawText = data[0].output[" Détail de facture"] || ""
        } else if (data[0]?.output?.[" Détail de facture"]) {
          // Direct access to array
          extractedRawText = data[0].output[" Détail de facture"]
        } else if (typeof data === "object") {
          // Try to find rawText in a nested object
          extractedRawText = findRawText(data)
        }

        setRawText(extractedRawText || "No raw text available")

        // Process the invoice data
        if (Array.isArray(data) && data[0]?.output) {
          // Handle array format
          const output = data[0].output
          setEditedData({
            invoiceNumber: output["Numéro de facture"] || "",
            invoiceDate: output.date || "",
            supplier: output.Fournisseur || output["name of the company"] || "",
            amount: output["Montant HT"] || "",
            vatAmount: output["Montant TVA"] || "",
            amountWithTax: output["Montant TTC"] || "",
          })
        } else if (data.invoice) {
          // Handle invoice object format
          setEditedData({ ...data.invoice })
        } else if (data.output) {
          // Handle output object format
          const output = data.output
          setEditedData({
            invoiceNumber: output["Numéro de facture"] || "",
            invoiceDate: output.date || "",
            supplier: output.Fournisseur || output["name of the company"] || "",
            amount: output["Montant HT"] || "",
            vatAmount: output["Montant TVA"] || "",
            amountWithTax: output["Montant TTC"] || "",
          })
        } else {
          // Direct data structure or unknown format
          setEditedData(data)
        }
      }
    } catch (error) {
      console.error("Error processing data in OcrResultViewer:", error)
      setRawText(`Error processing OCR data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }, [data])

  // Helper function to recursively search for raw text in nested objects
  const findRawText = (obj: any): string => {
    if (!obj || typeof obj !== "object") return ""

    // Direct properties that might contain raw text
    const textProperties = ["rawText", "text", " Détail de facture", "Détail de facture"]

    for (const prop of textProperties) {
      if (obj[prop] && typeof obj[prop] === "string") {
        return obj[prop]
      }
    }

    // Check nested properties
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const found = findRawText(obj[key])
        if (found) return found
      }
    }

    return ""
  }

  const handleFieldChange = (field: string, value: any) => {
    if (!editedData) return
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    if (onSave && editedData) {
      onSave(editedData)
    }
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Données de la facture</TabsTrigger>
          <TabsTrigger value="raw">Texte brut</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la facture</CardTitle>
              <CardDescription>Informations extraites de la facture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Numéro de facture</Label>
                  <Input
                    value={editedData?.invoiceNumber || ""}
                    onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Date de facture</Label>
                  <Input
                    value={editedData?.invoiceDate || ""}
                    onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Fournisseur</Label>
                  <Input
                    value={editedData?.supplier || ""}
                    onChange={(e) => handleFieldChange("supplier", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant HT</Label>
                  <Input
                    value={editedData?.amount || ""}
                    onChange={(e) => handleFieldChange("amount", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant TVA</Label>
                  <Input
                    value={editedData?.vatAmount || ""}
                    onChange={(e) => handleFieldChange("vatAmount", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant TTC</Label>
                  <Input
                    value={editedData?.amountWithTax || ""}
                    onChange={(e) => handleFieldChange("amountWithTax", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>Enregistrer</Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)}>Modifier</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Texte brut</CardTitle>
              <CardDescription>Texte extrait du document</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                {rawText || "Aucun texte brut disponible."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add default export as well to support both import styles
export default OcrResultViewer
