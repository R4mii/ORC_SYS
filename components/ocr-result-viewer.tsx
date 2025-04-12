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

  useEffect(() => {
    console.log("Received data:", data); // Debug log
    if (data && Array.isArray(data) && data.length > 0 && data[0].output) {
      const ocrOutput = data[0].output;
      setEditedData({
        Fournisseur: ocrOutput.Fournisseur || "Not available",
        date: ocrOutput.date || "Not available",
        "name of the company": ocrOutput["name of the company"] || "Not available",
        "Numéro de facture": ocrOutput["Numéro de facture"] || "Not available",
        "Montant HT": ocrOutput["Montant HT"] || "Not available",
        "Montant TVA": ocrOutput["Montant TVA"] || "Not available",
        "Montant TTC": ocrOutput["Montant TTC"] || "Not available",
        "Détail de facture": ocrOutput[" Détail de facture"] || "Not available",
      });
    } else {
      console.log("Invalid or empty OCR data");
    }
  }, [data])

  const handleFieldChange = (field: string, value: any) => {
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
                    value={editedData?.["Numéro de facture"] || ""}
                    onChange={(e) => handleFieldChange("Numéro de facture", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Date de facture</Label>
                  <Input
                    value={editedData?.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Fournisseur</Label>
                  <Input
                    value={editedData?.Fournisseur || ""}
                    onChange={(e) => handleFieldChange("Fournisseur", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant HT</Label>
                  <Input
                    value={editedData?.["Montant HT"] || ""}
                    onChange={(e) => handleFieldChange("Montant HT", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant TVA</Label>
                  <Input
                    value={editedData?.["Montant TVA"] || ""}
                    onChange={(e) => handleFieldChange("Montant TVA", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Montant TTC</Label>
                  <Input
                    value={editedData?.["Montant TTC"] || ""}
                    onChange={(e) => handleFieldChange("Montant TTC", e.target.value)}
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
                {editedData?.[" Détail de facture"] || "Aucun texte extrait"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OcrResultViewer
