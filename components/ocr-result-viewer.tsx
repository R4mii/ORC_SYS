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

// Change the export to include both default and named export
export function OcrResultViewer({ data, isProcessing, processingProgress, onSave }: OcrResultViewerProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<any>(null)

  useEffect(() => {
    try {
      // Improved data handling to handle different data structures
      if (data) {
        console.log("Raw data received in OcrResultViewer:", data)

        // Check if data is an array (like the example format)
        if (Array.isArray(data) && data[0]?.output) {
          // Handle the exact format from the example
          const output = data[0].output
          setEditedData({
            invoiceNumber: output["Numéro de facture"] || "",
            invoiceDate: output.date || "",
            supplier: output.Fournisseur || output["name of the company"] || "",
            amount: output["Montant HT"] || "",
            vatAmount: output["Montant TVA"] || "",
            amountWithTax: output["Montant TTC"] || "",
            rawText: output[" Détail de facture"] || "",
          })
          console.log("Processed array with output structure")
        } else {
          // Handle previous formats
          const dataToProcess = Array.isArray(data) ? data[0] : data

          if (dataToProcess?.invoice) {
            setEditedData({ ...dataToProcess.invoice })
            console.log("Data structure: invoice")
          } else if (dataToProcess?.output) {
            // Handle n8n output format for single object
            setEditedData({
              invoiceNumber: dataToProcess.output["Numéro de facture"] || "",
              invoiceDate: dataToProcess.output.date || "",
              supplier: dataToProcess.output.Fournisseur || dataToProcess.output["name of the company"] || "",
              amount: dataToProcess.output["Montant HT"] || "",
              vatAmount: dataToProcess.output["Montant TVA"] || "",
              amountWithTax: dataToProcess.output["Montant TTC"] || "",
              rawText: dataToProcess.output[" Détail de facture"] || "",
            })
            console.log("Data structure: n8n output (single object)")
          } else {
            // Direct data structure
            setEditedData(dataToProcess)
            console.log("Data structure: direct")
          }
        }
      }
    } catch (error: any) {
      console.error("Error processing data in OcrResultViewer:", error)
    }
  }, [data])

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

  // Update the getRawText function to simply stringify the data
  const getRawText = () => {
    if (!data) return "Aucun texte disponible."
    try {
      return JSON.stringify(data, null, 2) // Use JSON.stringify for the entire data object
    } catch (error) {
      console.error("Error stringifying data:", error)
      return "Erreur lors de la conversion des données en texte."
    }
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
                {getRawText()}
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
