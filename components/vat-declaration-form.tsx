"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Check, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/date-range-picker"

interface VATEntry {
  id: string
  date: string
  documentRef: string
  documentType: "purchase" | "sale"
  baseAmount: number
  vatAmount: number
  vatRate: number
  status: "pending" | "declared" | "paid"
}

interface VATDeclarationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (declaration: any) => void
  vatEntries: VATEntry[]
}

export function VATDeclarationForm({ isOpen, onClose, onSubmit, vatEntries }: VATDeclarationFormProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
  })
  const [reference, setReference] = useState("")
  const [activeTab, setActiveTab] = useState("entries")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Generate reference when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const year = dateRange.to.getFullYear()
      const quarter = Math.floor(dateRange.to.getMonth() / 3) + 1
      setReference(`TVA-${year}-Q${quarter}`)
    }
  }, [dateRange])

  // Filter VAT entries based on date range
  const filteredVATEntries = vatEntries.filter((entry) => {
    if (!dateRange) return false

    const entryDate = new Date(entry.date)
    return entryDate >= dateRange.from && entryDate <= dateRange.to && entry.status === "pending"
  })

  // Calculate VAT summary
  const vatCollected = filteredVATEntries
    .filter((entry) => entry.documentType === "sale")
    .reduce((sum, entry) => sum + entry.vatAmount, 0)

  const vatDeductible = filteredVATEntries
    .filter((entry) => entry.documentType === "purchase")
    .reduce((sum, entry) => sum + entry.vatAmount, 0)

  const vatBalance = vatCollected - vatDeductible

  // Group entries by VAT rate
  const entriesByRate: Record<number, VATEntry[]> = {}
  filteredVATEntries.forEach((entry) => {
    if (!entriesByRate[entry.vatRate]) {
      entriesByRate[entry.vatRate] = []
    }
    entriesByRate[entry.vatRate].push(entry)
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!dateRange?.from || !dateRange?.to) {
      newErrors.dateRange = "La période est requise"
    }

    if (!reference) {
      newErrors.reference = "La référence est requise"
    }

    if (filteredVATEntries.length === 0) {
      newErrors.entries = "Aucune écriture TVA trouvée pour cette période"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      setActiveTab("entries")
      return
    }

    if (!dateRange?.from || !dateRange?.to) return

    const declaration = {
      id: Math.random().toString(36).substring(2, 9),
      period: reference.split("-").slice(1).join("-"),
      startDate: dateRange.from.toISOString().split("T")[0],
      endDate: dateRange.to.toISOString().split("T")[0],
      totalCollected: vatCollected,
      totalDeductible: vatDeductible,
      netVAT: vatBalance,
      status: "draft",
      reference,
    }

    onSubmit(declaration)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nouvelle déclaration de TVA</DialogTitle>
          <DialogDescription>Créez une nouvelle déclaration de TVA pour la période sélectionnée.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entries">Écritures</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Période</Label>
                <DatePickerWithRange
                  date={dateRange}
                  setDate={setDateRange}
                  className={errors.dateRange ? "border-red-500" : ""}
                />
                {errors.dateRange && <p className="text-xs text-red-500">{errors.dateRange}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className={errors.reference ? "border-red-500" : ""}
                />
                {errors.reference && <p className="text-xs text-red-500">{errors.reference}</p>}
              </div>
            </div>

            {errors.entries && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{errors.entries}</AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Base HT</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                    <TableHead className="text-right">Montant TVA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVATEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Aucune écriture TVA trouvée pour cette période
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVATEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {entry.documentRef}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              entry.documentType === "sale"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                            }`}
                          >
                            {entry.documentType === "sale" ? "Vente" : "Achat"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{entry.baseAmount.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{entry.vatRate}%</TableCell>
                        <TableCell className="text-right">{entry.vatAmount.toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{reference}</h3>
                  <p className="text-sm text-muted-foreground">
                    Période: {dateRange?.from?.toLocaleDateString()} - {dateRange?.to?.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Statut: Brouillon</p>
                  <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="summary">
                  <AccordionTrigger>Résumé de la déclaration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">TVA Collectée</p>
                          <p className="text-lg font-medium">{vatCollected.toFixed(2)} DH</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">TVA Déductible</p>
                          <p className="text-lg font-medium">{vatDeductible.toFixed(2)} DH</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Solde TVA</p>
                          <p className={`text-lg font-medium ${vatBalance > 0 ? "text-red-500" : "text-green-500"}`}>
                            {vatBalance.toFixed(2)} DH
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm font-medium">Détail par taux de TVA</p>
                        <div className="mt-2 space-y-2">
                          {Object.keys(entriesByRate).map((rate) => {
                            const entries = entriesByRate[Number(rate)]
                            const collectedByRate = entries
                              .filter((e) => e.documentType === "sale")
                              .reduce((sum, e) => sum + e.vatAmount, 0)
                            const deductibleByRate = entries
                              .filter((e) => e.documentType === "purchase")
                              .reduce((sum, e) => sum + e.vatAmount, 0)

                            return (
                              <div key={rate} className="flex justify-between text-sm">
                                <span>Taux {rate}%</span>
                                <span>{(collectedByRate - deductibleByRate).toFixed(2)} DH</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details">
                  <AccordionTrigger>Détail des écritures</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">TVA Collectée</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Référence</TableHead>
                              <TableHead className="text-right">Base HT</TableHead>
                              <TableHead className="text-right">Taux</TableHead>
                              <TableHead className="text-right">TVA</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredVATEntries
                              .filter((e) => e.documentType === "sale")
                              .map((entry) => (
                                <TableRow key={entry.id}>
                                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{entry.documentRef}</TableCell>
                                  <TableCell className="text-right">{entry.baseAmount.toFixed(2)} DH</TableCell>
                                  <TableCell className="text-right">{entry.vatRate}%</TableCell>
                                  <TableCell className="text-right">{entry.vatAmount.toFixed(2)} DH</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">TVA Déductible</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Référence</TableHead>
                              <TableHead className="text-right">Base HT</TableHead>
                              <TableHead className="text-right">Taux</TableHead>
                              <TableHead className="text-right">TVA</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredVATEntries
                              .filter((e) => e.documentType === "purchase")
                              .map((entry) => (
                                <TableRow key={entry.id}>
                                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{entry.documentRef}</TableCell>
                                  <TableCell className="text-right">{entry.baseAmount.toFixed(2)} DH</TableCell>
                                  <TableCell className="text-right">{entry.vatRate}%</TableCell>
                                  <TableCell className="text-right">{entry.vatAmount.toFixed(2)} DH</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {vatBalance > 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>TVA à payer</AlertTitle>
                  <AlertDescription>
                    Vous devez payer {vatBalance.toFixed(2)} DH de TVA pour cette période.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Crédit de TVA</AlertTitle>
                  <AlertDescription>
                    Vous avez un crédit de TVA de {Math.abs(vatBalance).toFixed(2)} DH pour cette période.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Télécharger le brouillon
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Créer la déclaration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
