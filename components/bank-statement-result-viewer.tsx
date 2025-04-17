import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"

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

interface BankStatementResultViewerProps {
  data: {
    bankStatement: BankStatementData
    rawText?: string
  }
}

export default function BankStatementResultViewer({ data }: BankStatementResultViewerProps) {
  const { bankStatement } = data
  const hasLowConfidence = bankStatement.confidence < 0.7

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: bankStatement.currency || "MAD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-4">
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

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-muted p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Données extraites du relevé bancaire</h3>
              <Badge
                variant={hasLowConfidence ? "outline" : "default"}
                className={hasLowConfidence ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}
              >
                {hasLowConfidence ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                Confiance: {Math.round(bankStatement.confidence * 100)}%
              </Badge>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom du titulaire</p>
                <p className="font-medium">{bankStatement.accountHolder || "Non détecté"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Banque</p>
                <p className="font-medium">{bankStatement.bank || "Non détecté"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Numéro de compte</p>
                <p className="font-medium">{bankStatement.accountNumber || "Non détecté"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de relevé</p>
                <p className="font-medium">{bankStatement.statementDate || "Non détecté"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Ancien solde</p>
                <p className="font-medium">{formatCurrency(bankStatement.previousBalance)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouveau solde</p>
                <p className="font-medium">{formatCurrency(bankStatement.newBalance)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.rawText && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 border-b">
            <h3 className="font-medium text-sm">Texte brut extrait</h3>
          </div>
          <div className="p-3 max-h-[200px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">{data.rawText}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
