"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Upload, ArrowUpDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface BankStatementData {
  accountHolder: string
  bank: string
  accountNumber: string
  statementDate: string
  previousBalance: number
  newBalance: number
  currency: string
  confidence: number
}

interface BankStatementResultProps {
  data: BankStatementData
  onNewUpload: () => void
}

export function BankStatementResult({ data, onNewUpload }: BankStatementResultProps) {
  const hasLowConfidence = data.confidence < 0.7

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: data.currency || "MAD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Calculate balance difference and percentage
  const balanceDifference = data.newBalance - data.previousBalance
  const balancePercentage = data.previousBalance !== 0 ? (balanceDifference / Math.abs(data.previousBalance)) * 100 : 0

  const isPositiveChange = balanceDifference >= 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            Résultat du traitement
            {hasLowConfidence && (
              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Confiance faible
              </Badge>
            )}
          </div>
          <Button onClick={onNewUpload} variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Nouveau relevé
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasLowConfidence && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Confiance faible dans les résultats</p>
              <p className="mt-1">
                Certaines données extraites peuvent être incorrectes. Veuillez vérifier les informations avant de
                continuer.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nom du titulaire</h3>
              <p className="text-lg font-medium">{data.accountHolder || "Non détecté"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Banque</h3>
              <p className="text-lg font-medium">{data.bank || "Non détecté"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Numéro de compte</h3>
              <p className="text-lg font-medium">{data.accountNumber || "Non détecté"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date de relevé</h3>
              <p className="text-lg font-medium">{data.statementDate || "Non détecté"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Ancien solde</h3>
                <p className="text-lg font-medium">{formatCurrency(data.previousBalance)}</p>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Nouveau solde</h3>
                <p className="text-lg font-medium">{formatCurrency(data.newBalance)}</p>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUpDown className={`h-4 w-4 mr-1 ${isPositiveChange ? "text-green-500" : "text-red-500"}`} />
                  <h3 className="text-sm font-medium text-muted-foreground">Variation</h3>
                </div>
                <div className="flex flex-col items-end">
                  <p className={`text-lg font-medium ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                    {isPositiveChange ? "+" : ""}
                    {formatCurrency(balanceDifference)}
                  </p>
                  <p className={`text-xs ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                    {isPositiveChange ? "+" : ""}
                    {balancePercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <h3 className="text-sm font-medium">Traitement terminé</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Les données ont été extraites avec succès. Vous pouvez maintenant les utiliser pour vos opérations
                comptables.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
