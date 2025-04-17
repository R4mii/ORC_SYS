"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Receipt, Building2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { BankStatementUploadModal } from "@/components/bank-statement-upload-modal"
import { BankStatementResult } from "@/components/bank-statement-result"
import { FileUploadModal } from "@/components/file-upload-modal"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

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

interface InvoiceData {
  supplier: string
  invoiceNumber: string
  invoiceDate: string
  amount: number
  vatAmount: number
  amountWithTax: number
  currency: string
  confidence: number
  rawText: string
}

export default function DocumentProcessingPage() {
  const [activeTab, setActiveTab] = useState("bank-statements")

  // Bank statement state
  const [bankStatementModalOpen, setBankStatementModalOpen] = useState(false)
  const [bankStatementResult, setBankStatementResult] = useState<BankStatementData | null>(null)
  const [bankStatementProcessed, setBankStatementProcessed] = useState(false)
  const [bankStatementError, setBankStatementError] = useState<string | null>(null)

  // Invoice state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceResult, setInvoiceResult] = useState<InvoiceData | null>(null)
  const [invoiceProcessed, setInvoiceProcessed] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  const handleBankStatementUploadComplete = (result: any) => {
    console.log("Bank statement upload complete with result:", result)

    if (result && result.bankStatement) {
      setBankStatementResult(result.bankStatement)
      setBankStatementProcessed(true)
      setBankStatementError(null)

      toast({
        title: "Relevé bancaire traité avec succès",
        description: "Les données ont été extraites avec succès",
        variant: "default",
      })
    } else {
      setBankStatementError("Le traitement n'a pas pu extraire les données nécessaires")
      setBankStatementProcessed(false)

      toast({
        title: "Erreur de traitement",
        description: "Le traitement n'a pas pu extraire les données nécessaires",
        variant: "destructive",
      })
    }

    setBankStatementModalOpen(false)
  }

  const handleInvoiceUploadComplete = (result: any) => {
    console.log("Invoice upload complete with result:", result)

    if (result && result.invoice) {
      setInvoiceResult(result.invoice)
      setInvoiceProcessed(true)
      setInvoiceError(null)

      toast({
        title: "Facture traitée avec succès",
        description: "Les données ont été extraites avec succès",
        variant: "default",
      })
    } else {
      setInvoiceError("Le traitement n'a pas pu extraire les données nécessaires")
      setInvoiceProcessed(false)

      toast({
        title: "Erreur de traitement",
        description: "Le traitement n'a pas pu extraire les données nécessaires",
        variant: "destructive",
      })
    }

    setInvoiceModalOpen(false)
  }

  const handleNewBankStatementUpload = () => {
    setBankStatementResult(null)
    setBankStatementProcessed(false)
    setBankStatementError(null)
    setBankStatementModalOpen(true)
  }

  const handleNewInvoiceUpload = () => {
    setInvoiceResult(null)
    setInvoiceProcessed(false)
    setInvoiceError(null)
    setInvoiceModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Traitement de documents financiers</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bank-statements" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Relevés bancaires</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Factures</span>
          </TabsTrigger>
        </TabsList>

        {/* Bank Statements Tab */}
        <TabsContent value="bank-statements" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {!bankStatementProcessed ? (
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
                  <Button onClick={() => setBankStatementModalOpen(true)} className="mt-4" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Charger un relevé bancaire
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {bankStatementResult ? (
                  <BankStatementResult data={bankStatementResult} onNewUpload={handleNewBankStatementUpload} />
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
                        {bankStatementError || "Une erreur s'est produite lors du traitement du relevé bancaire."}
                      </p>
                      <Button onClick={handleNewBankStatementUpload} variant="outline">
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
                    Nous extrayons automatiquement le nom du titulaire, la banque, le numéro de compte, la date du
                    relevé, l'ancien solde et le nouveau solde.
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
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {!invoiceProcessed ? (
              <Card>
                <CardHeader>
                  <CardTitle>Charger une facture</CardTitle>
                  <CardDescription>
                    Téléchargez une facture au format PDF ou image pour extraction automatique des données
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Receipt className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground max-w-md">
                    Chargez votre facture pour extraire automatiquement les informations importantes comme le
                    fournisseur, le numéro de facture, les montants et plus encore.
                  </p>
                  <Button onClick={() => setInvoiceModalOpen(true)} className="mt-4" size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Charger une facture
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {invoiceResult ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          Résultat du traitement
                          {invoiceResult.confidence < 0.7 && (
                            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Confiance faible
                            </Badge>
                          )}
                        </div>
                        <Button onClick={handleNewInvoiceUpload} variant="outline" size="sm" className="gap-1">
                          <Upload className="h-4 w-4" />
                          Nouvelle facture
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {invoiceResult.confidence < 0.7 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-start">
                          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Confiance faible dans les résultats</p>
                            <p className="mt-1">
                              Certaines données extraites peuvent être incorrectes. Veuillez vérifier les informations
                              avant de continuer.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Fournisseur</h3>
                            <p className="text-lg font-medium">{invoiceResult.supplier || "Non détecté"}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Numéro de facture</h3>
                            <p className="text-lg font-medium">{invoiceResult.invoiceNumber || "Non détecté"}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Date de facture</h3>
                            <p className="text-lg font-medium">{invoiceResult.invoiceDate || "Non détecté"}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-muted-foreground">Montant HT</h3>
                              <p className="text-lg font-medium">
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: invoiceResult.currency || "MAD",
                                }).format(invoiceResult.amount)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-muted-foreground">Montant TVA</h3>
                              <p className="text-lg font-medium">
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: invoiceResult.currency || "MAD",
                                }).format(invoiceResult.vatAmount)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-muted-foreground">Montant TTC</h3>
                              <p className="text-lg font-medium">
                                {new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: invoiceResult.currency || "MAD",
                                }).format(invoiceResult.amountWithTax)}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center mb-2">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              <h3 className="text-sm font-medium">Traitement terminé</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Les données ont été extraites avec succès. Vous pouvez maintenant les utiliser pour vos
                              opérations comptables.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                        {invoiceError || "Une erreur s'est produite lors du traitement de la facture."}
                      </p>
                      <Button onClick={handleNewInvoiceUpload} variant="outline">
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
                <CardTitle className="text-lg">À propos du traitement des factures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Formats supportés
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Notre système prend en charge les factures au format PDF, JPG et PNG.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Données extraites
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Nous extrayons automatiquement le fournisseur, le numéro de facture, la date, les montants HT, TVA
                    et TTC.
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
        </TabsContent>
      </Tabs>

      {/* Upload Modals */}
      <BankStatementUploadModal
        open={bankStatementModalOpen}
        onClose={() => setBankStatementModalOpen(false)}
        onUploadComplete={handleBankStatementUploadComplete}
      />

      <FileUploadModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        documentType="purchases"
        onUploadComplete={handleInvoiceUploadComplete}
      />
    </div>
  )
}
