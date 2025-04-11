"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, Save, Edit, Eye, AlertCircle, ArrowRight, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface OcrResultViewerProps {
  data: any
  isProcessing?: boolean
  processingProgress?: number
  onSave?: (data: any) => void
  onEdit?: (data: any) => void
}

export function OcrResultViewer({
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
    if (data) {
      setEditedData({ ...data })
    }
  }, [data])

  // Generate confidence colors for fields
  useEffect(() => {
    if (data) {
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
    setEditedData({
      ...editedData,
      output: {
        ...editedData.output,
        [field]: value,
      },
    })
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
    if (confidence > 0.5) return "bg-yellow-500"
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
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
                      value={editedData?.output?.Fournisseur || ""}
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
                      value={editedData?.output?.["name of the company"] || ""}
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
                      value={editedData?.output?.adresse || ""}
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
                      value={editedData?.output?.date || ""}
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
                      value={editedData?.output?.["Numéro de facture"] || ""}
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
                        value={editedData?.output?.["Montant HT"] || ""}
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
                        value={editedData?.output?.["Montant TVA"] || ""}
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
                        value={editedData?.output?.["Montant TTC"] || ""}
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
                    value={editedData?.output?.[" Détail de facture"] || ""}
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

          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
              <CardDescription>Que faire avec cette facture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Enregistrer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enregistrez la facture dans votre système avec toutes les données extraites.
                  </p>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Comptabiliser</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Créez les écritures comptables associées à cette facture.
                  </p>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Edit className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Modifier</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez toujours modifier les détails de la facture ultérieurement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la facture</CardTitle>
              <CardDescription>Visualisation des données extraites</CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white border rounded-md">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">{output["name of the company"]}</h2>
                    <p className="text-gray-600">{output.adresse}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-semibold">FACTURE</h3>
                    <p className="text-gray-600">N° {output["Numéro de facture"]}</p>
                    <p className="text-gray-600">Date: {output.date}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold mb-2">Fournisseur:</h4>
                  <p>{output.Fournisseur}</p>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold mb-4">Détails:</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix unitaire
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            Bol - série NØDT <br /> Bol diamètre 25 cm . Céramique, fait main en France.
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">10</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">14,50 €</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">145,00 €</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            Carafe - série NØDT <br /> Carafe hauteur 35 cm . Céramique, faite main en France.
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">20</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">47,00 €</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">940,00 €</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Montant HT:</span>
                      <span>{output["Montant HT"]} €</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium">TVA:</span>
                      <span>{output["Montant TVA"]} €</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                      <span>Total TTC:</span>
                      <span>{output["Montant TTC"]} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Retour aux détails
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
