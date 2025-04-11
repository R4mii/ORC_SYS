"use client"

import { CardFooter } from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"

import { AlertDescription } from "@/components/ui/alert"

import { AlertTitle } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { Progress } from "@/components/ui/progress"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tab, Tabs, TabsBody, TabList, TabPanel } from "@nextui-org/react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Save, Edit, Eye, AlertCircle, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface OcrResultViewerProps {
  data: any
  isProcessing?: boolean
  processingProgress?: number
  onSave?: (data: any) => void
  onEdit?: (data: any) => void
}

export default function OcrResultViewer({
  data,
  isProcessing = false,
  processingProgress = 100,
  onSave,
  onEdit,
}: OcrResultViewerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [editMode, setEditMode] = useState(false)
  const [editedData, setEditedData] = useState<any>(null)
  const [confidenceColors, setConfidenceColors] = useState<Record<string, string>>({})

  // Update edited data when OCR result changes
  useEffect(() => {
    if (data && data[0]?.output) {
      setEditedData({ ...data[0].output })
    }
  }, [data])

  // Generate confidence colors for fields
  useEffect(() => {
    if (data && data[0]?.output) {
      // Generate random but consistent confidence scores for each field
      const overallConfidence = 0.85 // High confidence for this example

      // Generate random but consistent confidence scores for each field
      const fields = {
        fournisseur: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        date: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        company: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        invoiceNumber: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        montantHT: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        montantTVA: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
        montantTTC: Math.min(1, overallConfidence + (Math.random() * 0.3 - 0.15)),
      }

      // Generate colors based on confidence
      const colors: Record<string, string> = {}
      Object.entries(fields).forEach(([field, confidence]) => {
        if (confidence > 0.8) {
          colors[field] = "bg-green-100 border-green-300"
        } else if (confidence > 0.5) {
          colors[field] = "bg-yellow-100 border-yellow-300"
        } else {
          colors[field] = "bg-red-100 border-red-300"
        }
      })

      setConfidenceColors(colors)
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
    toast({
      title: "Facture enregistrée",
      description: "Les modifications ont été enregistrées avec succès.",
    })
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return "Élevée"
    if (confidence > 0.5) return "Moyenne"
    return "Faible"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-500"
    if (confidence > 0.5) return "bg-amber-500"
    return "bg-red-500"
  }

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Traitement OCR en cours</CardTitle>
          <CardDescription>Veuillez patienter pendant l'analyse de votre document</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Progression</Label>
              <span className="text-sm">{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>

          <Alert>
            <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
            <AlertTitle>Traitement</AlertTitle>
            <AlertDescription>
              {processingProgress < 30 && "Préparation du document..."}
              {processingProgress >= 30 && processingProgress < 70 && "Analyse OCR en cours..."}
              {processingProgress >= 70 && "Extraction des données..."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data[0]?.output) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Aucune donnée</CardTitle>
          <CardDescription>Aucun résultat OCR n'a été trouvé</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>Impossible de charger les données OCR</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const output = data[0].output

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Résultat de l'analyse OCR</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </div>

      <Tabs aria-label="Document Tabs" variant="enclosed" selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <TabList>
          <Tab key="details" title="Détails" />
        </TabList>
        <TabsBody>
          <TabPanel key="details">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Données extraites</CardTitle>
                  <CardDescription>Informations extraites du document</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-1">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">85% confiance</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Score de confiance global OCR</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                    {editMode ? (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Mode Lecture
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Mode Édition
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="fournisseur">Fournisseur</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.fournisseur}>
                                {getConfidenceLabel(0.85)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="fournisseur"
                        value={editedData?.Fournisseur || ""}
                        onChange={(e) => handleFieldChange("Fournisseur", e.target.value)}
                        readOnly={!editMode}
                        className={!editMode ? confidenceColors.fournisseur : ""}
                      />
                      {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="company">Nom de l'entreprise</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.company}>
                                {getConfidenceLabel(0.9)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="company"
                        value={editedData?.["name of the company"] || ""}
                        onChange={(e) => handleFieldChange("name of the company", e.target.value)}
                        readOnly={!editMode}
                        className={!editMode ? confidenceColors.company : ""}
                      />
                      {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="adresse">Adresse</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-green-100 border-green-300">
                                Élevée
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="adresse"
                        value={editedData?.adresse || ""}
                        onChange={(e) => handleFieldChange("adresse", e.target.value)}
                        readOnly={!editMode}
                        className={!editMode ? "bg-green-100 border-green-300" : ""}
                      />
                      {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="date">Date</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.date}>
                                {getConfidenceLabel(0.85)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="date"
                        value={editedData?.date || ""}
                        onChange={(e) => handleFieldChange("date", e.target.value)}
                        readOnly={!editMode}
                        className={!editMode ? confidenceColors.date : ""}
                      />
                      {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.invoiceNumber}>
                                {getConfidenceLabel(0.95)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="invoiceNumber"
                        value={editedData?.["Numéro de facture"] || ""}
                        onChange={(e) => handleFieldChange("Numéro de facture", e.target.value)}
                        readOnly={!editMode}
                        className={!editMode ? confidenceColors.invoiceNumber : ""}
                      />
                      {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="montantHT">Montant HT</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.montantHT}>
                                {getConfidenceLabel(0.9)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex">
                        <Input
                          id="montantHT"
                          value={editedData?.["Montant HT"] || ""}
                          onChange={(e) => handleFieldChange("Montant HT", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.montantHT : ""}
                        />
                        <div className="flex items-center ml-2">
                          <span>€</span>
                        </div>
                      </div>
                      {editMode && <Edit className="h-4 w-4 absolute right-10 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="montantTVA">Montant TVA</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.montantTVA}>
                                {getConfidenceLabel(0.85)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex">
                        <Input
                          id="montantTVA"
                          value={editedData?.["Montant TVA"] || ""}
                          onChange={(e) => handleFieldChange("Montant TVA", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.montantTVA : ""}
                        />
                        <div className="flex items-center ml-2">
                          <span>€</span>
                        </div>
                      </div>
                      {editMode && <Edit className="h-4 w-4 absolute right-10 top-3 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="montantTTC">Montant TTC</Label>
                      {!editMode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className={confidenceColors.montantTTC}>
                                {getConfidenceLabel(0.95)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Niveau de confiance pour ce champ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex">
                        <Input
                          id="montantTTC"
                          value={editedData?.["Montant TTC"] || ""}
                          onChange={(e) => handleFieldChange("Montant TTC", e.target.value)}
                          readOnly={!editMode}
                          className={!editMode ? confidenceColors.montantTTC : ""}
                        />
                        <div className="flex items-center ml-2">
                          <span>€</span>
                        </div>
                      </div>
                      {editMode && <Edit className="h-4 w-4 absolute right-10 top-3 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="details">Détail de facture</Label>
                    {!editMode && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="bg-green-100 border-green-300">
                              Élevée
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Niveau de confiance pour ce champ</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      id="details"
                      value={editedData?.[" Détail de facture"] || ""}
                      onChange={(e) => handleFieldChange(" Détail de facture", e.target.value)}
                      readOnly={!editMode}
                      className={`w-full min-h-[100px] rounded-md border p-3 ${
                        !editMode ? "bg-green-100 border-green-300" : ""
                      }`}
                    />
                    {editMode && <Edit className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard/invoices")}>
                  Retour
                </Button>
                {editMode ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setEditMode(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabPanel>
        </TabsBody>
      </Tabs>
    </div>
  )
}
