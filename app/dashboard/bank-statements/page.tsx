"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { BankStatementUploader } from "@/components/bank-statement-uploader"
import { BankStatementResult } from "@/components/bank-statement-result"

// Define the bank statement data structure
export interface BankStatementData {
  accountHolder: string
  bank: string
  accountNumber: string
  statementDate: string
  previousBalance: string
  newBalance: string
  rawText?: string
  confidence?: number
}

export default function BankStatementPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BankStatementData | null>(null)

  const handleUploadComplete = (data: any) => {
    setIsProcessing(false)

    if (data.error) {
      setError(data.error)
      return
    }

    // Transform the OCR response to our BankStatementData format
    // This assumes the webhook returns data in a specific format
    // You may need to adjust this based on the actual response
    const statementData: BankStatementData = {
      accountHolder: data.accountHolder || data.account?.holder || "Non détecté",
      bank: data.bank || data.account?.bank || "Non détecté",
      accountNumber: data.accountNumber || data.account?.number || "Non détecté",
      statementDate: data.statementDate || data.date || "Non détecté",
      previousBalance: data.previousBalance || data.balances?.previous || "0,00",
      newBalance: data.newBalance || data.balances?.new || "0,00",
      rawText: data.rawText,
      confidence: data.confidence || 0.7,
    }

    setResult(statementData)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setError(null)
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Retour</span>
        </Button>
        <h1 className="ml-4 text-2xl font-bold">Traitement des relevés bancaires</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Télécharger un relevé bancaire</CardTitle>
            <CardDescription>
              Téléchargez un relevé bancaire au format PDF ou image pour extraire automatiquement les informations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <BankStatementUploader
                onProcessingStart={handleProcessingStart}
                onUploadComplete={handleUploadComplete}
                isProcessing={isProcessing}
                error={error}
              />
            ) : (
              <div className="space-y-6">
                <BankStatementResult data={result} />
                <div className="flex justify-end">
                  <Button onClick={handleReset} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Traiter un autre relevé
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
