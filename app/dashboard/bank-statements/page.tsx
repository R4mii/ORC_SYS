"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { BankStatementUploadModal } from "@/components/bank-statement-upload-modal"
import { BankStatementResult } from "@/components/bank-statement-result"
import { toast } from "@/hooks/use-toast"

interface BankStatementData {
  accountHolder: string
  bank: string
  accountNumber: string
  statementDate: string
  previousBalance: number
  newBalance: number
  currency: string
  confidence: number
  rawText: string
}

export default function BankStatementsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [processingResult, setProcessingResult] = useState<BankStatementData | null>(null)
  const [isProcessed, setIsProcessed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (result: any) => {
    console.log("Upload complete with result:", result)

    if (result && result.bankStatement) {
      setProcessingResult(result.bankStatement)
      setIsProcessed(true)
      setError(null)

      toast({
        title: "Relevé bancaire traité avec succès",
        description: "Les données ont été extraites avec succès",
        variant: "default",
      })
    } else {
      setError("Le traitement n'a pas pu extraire les données nécessaires")
      setIsProcessed(false)

      toast({
        title: "Erreur de traitement",
        description: "Le traitement n'a pas pu extraire les données nécessaires",
        variant: "destructive",
      })
    }

    setUploadModalOpen(false)
  }

  const handleNewUpload = () => {
    setProcessingResult(null)
    setIsProcessed(false)
    setError(null)
    setUploadModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Traitement des relevés bancaires</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!isProcessed ? (
          <Card>
            <CardHeader>
              <CardTitle>Charger un relevé bancaire</CardTitle>
              <CardDescription>
                Téléchargez un relevé bancaire au format PDF ou image pour extraction automatique des données
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground max-w-md">
                Chargez votre relevé bancaire pour extraire automatiquement les informations importantes comme le
                titulaire du compte, le numéro de compte, les soldes et plus encore.
              </p>
              <Button onClick={() => setUploadModalOpen(true)} className="mt-4" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Charger un relevé bancaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {processingResult ? (
              <BankStatementResult data={processingResult} onNewUpload={handleNewUpload} />
            ) : (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center text-destructive">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Erreur de traitement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {error || "Une erreur s'est produite lors du traitement du relevé bancaire."}
                  </p>
                  <Button onClick={handleNewUpload} variant="outline">
                    Essayer à nouveau
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Information card */}
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg">À propos du traitement des relevés bancaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Formats supportés
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                Notre système prend en charge les relevés bancaires au format PDF, JPG et PNG.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Données extraites
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                Nous extrayons automatiquement le nom du titulaire, la banque, le numéro de compte, la date du relevé,
                l'ancien solde et le nouveau solde.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Confidentialité
              </h3>
              <p className="text-sm text-muted-foreground ml-6">
                Vos données sont traitées de manière sécurisée et ne sont pas stockées sur nos serveurs après le
                traitement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BankStatementUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
