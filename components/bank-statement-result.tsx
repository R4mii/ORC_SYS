"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, FileText, Building, Calendar, CreditCard, ArrowDownUp } from "lucide-react"

interface BankStatementData {
  accountHolder: string
  bank: string
  accountNumber: string
  statementDate: string
  previousBalance: number
  newBalance: number
  currency: string
  confidence: number
  rawText?: string
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

  // Calculate the difference between new and previous balance
  const balanceDifference = data.newBalance - data.previousBalance
  const isPositiveDifference = balanceDifference >= 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Résultat du traitement</h2>
        <Button onClick={onNewUpload} variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Charger un nouveau relevé
        </Button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-500" />
              Informations bancaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom du titulaire</p>
              <p className="font-medium">{data.accountHolder || "Non détecté"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Banque</p>
              <p className="font-medium">{data.bank || "Non détecté"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Numéro de compte</p>
              <p className="font-medium">{data.accountNumber || "Non détecté"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de relevé</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                {data.statementDate || "Non détecté"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              Informations financières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ancien solde</p>
              <p className="font-medium">{formatCurrency(data.previousBalance)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Nouveau solde</p>
              <p className="font-medium">{formatCurrency(data.newBalance)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Variation</p>
              <p
                className={`font-medium flex items-center ${isPositiveDifference ? "text-green-600" : "text-red-600"}`}
              >
                <ArrowDownUp className="h-4 w-4 mr-1" />
                {formatCurrency(Math.abs(balanceDifference))}
                <Badge
                  variant="outline"
                  className={`ml-2 ${isPositiveDifference ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {isPositiveDifference ? "+" : "-"}
                  {Math.abs((balanceDifference / data.previousBalance) * 100).toFixed(2)}%
                </Badge>
              </p>
            </div>

            <div className="pt-2">
              <Badge
                variant="outline"
                className={`${hasLowConfidence ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}
              >
                {hasLowConfidence ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                Confiance: {Math.round(data.confidence * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.rawText && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Texte brut extrait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto bg-muted/30 p-3 rounded-md">
              <pre className="text-xs whitespace-pre-wrap">{data.rawText}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
