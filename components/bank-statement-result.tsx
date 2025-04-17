import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import type { BankStatementData } from "@/app/dashboard/bank-statements/page"

interface BankStatementResultProps {
  data: BankStatementData
}

export function BankStatementResult({ data }: BankStatementResultProps) {
  // Determine confidence level for UI display
  const confidenceLevel = data.confidence ? data.confidence : 0
  const isHighConfidence = confidenceLevel >= 0.8

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Résultats de l'extraction</h3>
        <Badge
          variant={isHighConfidence ? "default" : "outline"}
          className={`flex items-center gap-1 ${isHighConfidence ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
        >
          {isHighConfidence ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {isHighConfidence ? "Haute confiance" : "Confiance moyenne"}
        </Badge>
      </div>

      <Card className="overflow-hidden border bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium text-muted-foreground">Informations du compte</h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nom du titulaire</dt>
                  <dd className="text-base font-semibold">{data.accountHolder}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Banque</dt>
                  <dd className="text-base font-semibold">{data.bank}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Numéro de compte</dt>
                  <dd className="text-base font-semibold">{data.accountNumber}</dd>
                </div>
              </dl>
            </div>

            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium text-muted-foreground">Informations du relevé</h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date du relevé</dt>
                  <dd className="text-base font-semibold">{data.statementDate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Ancien solde</dt>
                  <dd className="text-base font-semibold">{data.previousBalance} DH</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nouveau solde</dt>
                  <dd className="text-base font-semibold">{data.newBalance} DH</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.rawText && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Texte extrait (brut)</h4>
          <div className="max-h-40 overflow-y-auto rounded-md bg-muted p-4">
            <pre className="text-xs">{data.rawText}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
