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
      // Add detailed logging to track data flow
      console.log("Raw data received in OcrResultViewer:", data)

      if (data) {
        // Handle n8n specific format where data is an array
        if (Array.isArray(data)) {
          console.log("Data is an array, processing first item:", data[0])

          // Direct access to structure from n8n webhook
          if (data[0]?.output) {
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
            console.log("Successfully parsed n8n array format data")
          }
        }
        // Handle case where data might be a direct object with output property
        else if (data.output) {
          console.log("Data has direct output property:", data.output)
          const output = data.output
          setEditedData({
            invoiceNumber: output["Numéro de facture"] || "",
            invoiceDate: output.date || "",
            supplier: output.Fournisseur || output["name of the company"] || "",
            amount: output["Montant HT"] || "",
            vatAmount: output["Montant TVA"] || "",
            amountWithTax: output["Montant TTC"] || "",
            rawText: output[" Détail de facture"] || "",
          })
          console.log("Successfully parsed direct output format")
        }
        // Handle case where data has invoice property
        else if (data.invoice) {
          console.log("Data has invoice property:", data.invoice)
          setEditedData({
            ...data.invoice,
            rawText: data.rawText || "",
          })
          console.log("Successfully parsed invoice format")
        }
        // Handle direct format
        else if (typeof data === "object") {
          console.log("Data is a direct object:", data)
          setEditedData(data)
          console.log("Using data directly")
        }

        // Add fallback for unexpected structures
        if (!editedData && typeof data === "string") {
          try {
            const parsedData = JSON.parse(data)
            console.log("Parsed string data:", parsedData)
            setEditedData(parsedData)
          } catch (parseError) {
            console.error("Failed to parse data string:", parseError)
          }
        }
      }
    } catch (error) {
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
      // Check for rawText in data
      if (data.rawText) return data.rawText

      // Check for rawText in first array item
      if (Array.isArray(data) && data[0]?.output?.[" Détail de facture"]) {
        return data[0].output[" Détail de facture"]
      }

      // Check for direct output property
      if (data.output?.[" Détail de facture"]) {
        return data.output[" Détail de facture"]
      }

      // Fallback to stringifying the entire object
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error("Error extracting raw text:", error)
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
              {/* Add error state display */}
              {!editedData && !isProcessing && (
                <div className="rounded-md bg-amber-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Erreur de traitement des données</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Nous n'avons pas pu extraire correctement les données de cette facture. Veuillez vérifier le
                          format ou contacter le support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
                  <p className="text-center text-muted-foreground">Traitement du document en cours...</p>
                  {processingProgress !== undefined && (
                    <div className="w-full mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${processingProgress}%` }}></div>
                    </div>
                  )}
                </div>
              )}

              {editedData && (
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
              )}
            </CardContent>
            <CardFooter>
              {editedData &&
                (editMode ? (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </>
                ) : (
                  <Button onClick={() => setEditMode(true)}>Modifier</Button>
                ))}
              {!editedData && !isProcessing && onSave && (
                <Button variant="secondary" onClick={() => onSave({})}>
                  Continuer malgré l'erreur
                </Button>
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
