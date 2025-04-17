"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, Calendar, FileText, ArrowRight, BarChart3, PieChart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { VATDeclarationForm } from "@/components/vat-declaration-form"

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

interface VATDeclaration {
  id: string
  period: string
  startDate: string
  endDate: string
  totalCollected: number
  totalDeductible: number
  netVAT: number
  status: "draft" | "submitted" | "paid"
  submissionDate?: string
  paymentDate?: string
  reference?: string
}

export default function VATPage() {
  const router = useRouter()
  const [vatEntries, setVatEntries] = useState<VATEntry[]>([])
  const [vatDeclarations, setVatDeclarations] = useState<VATDeclaration[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Load VAT data for the current company
  useEffect(() => {
    // Only run this code in the browser
    if (typeof window === "undefined") return

    // Get the selected company from localStorage
    const companyId = localStorage.getItem("selectedCompanyId")
    if (!companyId) {
      router.push("/auth/login")
      return
    }

    setCurrentCompanyId(companyId)

    // Get VAT entries for this company
    const vatEntriesData = localStorage.getItem(`vat_entries_${companyId}`)
    if (vatEntriesData) {
      setVatEntries(JSON.parse(vatEntriesData))
    } else {
      // Initialize with sample data if no entries exist
      const sampleEntries = generateSampleVATEntries()
      localStorage.setItem(`vat_entries_${companyId}`, JSON.stringify(sampleEntries))
      setVatEntries(sampleEntries)
    }

    // Get VAT declarations for this company
    const vatDeclarationsData = localStorage.getItem(`vat_declarations_${companyId}`)
    if (vatDeclarationsData) {
      setVatDeclarations(JSON.parse(vatDeclarationsData))
    } else {
      // Initialize with sample data if no declarations exist
      const sampleDeclarations = generateSampleVATDeclarations()
      localStorage.setItem(`vat_declarations_${companyId}`, JSON.stringify(sampleDeclarations))
      setVatDeclarations(sampleDeclarations)
    }
  }, [router])

  const generateSampleVATEntries = (): VATEntry[] => {
    return [
      {
        id: "vat1",
        date: "2024-04-05",
        documentRef: "INV-2024-001",
        documentType: "sale",
        baseAmount: 10000,
        vatAmount: 2000,
        vatRate: 20,
        status: "pending",
      },
      {
        id: "vat2",
        date: "2024-04-10",
        documentRef: "INV-2024-002",
        documentType: "purchase",
        baseAmount: 5000,
        vatAmount: 1000,
        vatRate: 20,
        status: "pending",
      },
      {
        id: "vat3",
        date: "2024-04-15",
        documentRef: "INV-2024-003",
        documentType: "sale",
        baseAmount: 8000,
        vatAmount: 1600,
        vatRate: 20,
        status: "pending",
      },
      {
        id: "vat4",
        date: "2024-04-20",
        documentRef: "INV-2024-004",
        documentType: "purchase",
        baseAmount: 3000,
        vatAmount: 600,
        vatRate: 20,
        status: "pending",
      },
      {
        id: "vat5",
        date: "2024-03-10",
        documentRef: "INV-2024-005",
        documentType: "sale",
        baseAmount: 12000,
        vatAmount: 2400,
        vatRate: 20,
        status: "declared",
      },
      {
        id: "vat6",
        date: "2024-03-15",
        documentRef: "INV-2024-006",
        documentType: "purchase",
        baseAmount: 4500,
        vatAmount: 900,
        vatRate: 20,
        status: "declared",
      },
    ]
  }

  const generateSampleVATDeclarations = (): VATDeclaration[] => {
    return [
      {
        id: "decl1",
        period: "Q1 2024",
        startDate: "2024-01-01",
        endDate: "2024-03-31",
        totalCollected: 15000,
        totalDeductible: 8000,
        netVAT: 7000,
        status: "submitted",
        submissionDate: "2024-04-15",
        reference: "VAT-2024-Q1",
      },
      {
        id: "decl2",
        period: "Q4 2023",
        startDate: "2023-10-01",
        endDate: "2023-12-31",
        totalCollected: 18000,
        totalDeductible: 9500,
        netVAT: 8500,
        status: "paid",
        submissionDate: "2024-01-15",
        paymentDate: "2024-01-20",
        reference: "VAT-2023-Q4",
      },
    ]
  }

  const handleAddDeclaration = (newDeclaration: VATDeclaration) => {
    if (!currentCompanyId) return

    // Add the new declaration to the list
    const updatedDeclarations = [newDeclaration, ...vatDeclarations]
    setVatDeclarations(updatedDeclarations)

    // Save to localStorage
    localStorage.setItem(`vat_declarations_${currentCompanyId}`, JSON.stringify(updatedDeclarations))

    // Update the status of VAT entries included in this declaration
    const startDate = new Date(newDeclaration.startDate)
    const endDate = new Date(newDeclaration.endDate)

    const updatedEntries = vatEntries.map((entry) => {
      const entryDate = new Date(entry.date)
      if (entryDate >= startDate && entryDate <= endDate && entry.status === "pending") {
        return { ...entry, status: "declared" }
      }
      return entry
    })

    setVatEntries(updatedEntries)
    localStorage.setItem(`vat_entries_${currentCompanyId}`, JSON.stringify(updatedEntries))

    // Close the form
    setIsFormOpen(false)
  }

  // Filter VAT entries based on date range
  const filteredVATEntries = vatEntries.filter((entry) => {
    if (!dateRange) return true

    const entryDate = new Date(entry.date)
    return entryDate >= dateRange.from && entryDate <= dateRange.to
  })

  // Calculate VAT summary
  const vatCollected = filteredVATEntries
    .filter((entry) => entry.documentType === "sale")
    .reduce((sum, entry) => sum + entry.vatAmount, 0)

  const vatDeductible = filteredVATEntries
    .filter((entry) => entry.documentType === "purchase")
    .reduce((sum, entry) => sum + entry.vatAmount, 0)

  const vatBalance = vatCollected - vatDeductible

  // Count entries by status
  const pendingEntries = filteredVATEntries.filter((entry) => entry.status === "pending").length
  const declaredEntries = filteredVATEntries.filter((entry) => entry.status === "declared").length
  const paidEntries = filteredVATEntries.filter((entry) => entry.status === "paid").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion de la TVA</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>
            Nouvelle déclaration
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="entries">Écritures TVA</TabsTrigger>
          <TabsTrigger value="declarations">Déclarations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">TVA Collectée</CardTitle>
                <CardDescription>TVA sur les ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vatCollected.toFixed(2)} DH</div>
                <Progress value={vatBalance > 0 ? 100 : (vatCollected / vatDeductible) * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">TVA Déductible</CardTitle>
                <CardDescription>TVA sur les achats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vatDeductible.toFixed(2)} DH</div>
                <Progress value={vatBalance < 0 ? 100 : (vatDeductible / vatCollected) * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Solde TVA</CardTitle>
                <CardDescription>Montant à payer/récupérer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${vatBalance > 0 ? "text-red-500" : "text-green-500"}`}>
                  {vatBalance.toFixed(2)} DH
                </div>
                <div className="text-sm text-muted-foreground mt-2">{vatBalance > 0 ? "À payer" : "À récupérer"}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Statut des écritures TVA</CardTitle>
                <CardDescription>Répartition par statut</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[200px] flex items-center justify-center">
                  <PieChart className="h-32 w-32 text-muted-foreground/50" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-0">
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                      <span className="text-sm">En attente</span>
                    </div>
                    <span className="text-sm font-medium">{pendingEntries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                      <span className="text-sm">Déclarées</span>
                    </div>
                    <span className="text-sm font-medium">{declaredEntries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                      <span className="text-sm">Payées</span>
                    </div>
                    <span className="text-sm font-medium">{paidEntries}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution de la TVA</CardTitle>
                <CardDescription>Sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[200px] flex items-center justify-center">
                  <BarChart3 className="h-32 w-32 text-muted-foreground/50" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">
                  Voir le rapport détaillé
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prochaines échéances</CardTitle>
              <CardDescription>Calendrier des déclarations à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Déclaration TVA Q2 2024</h4>
                    <p className="text-xs text-muted-foreground">Échéance: 20 juillet 2024</p>
                  </div>
                  <Button size="sm">Préparer</Button>
                </div>

                <div className="flex items-center p-3 border rounded-lg">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Déclaration TVA Q3 2024</h4>
                    <p className="text-xs text-muted-foreground">Échéance: 20 octobre 2024</p>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Préparer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
                <Button variant="outline" className="md:self-end">
                  Appliquer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Base HT</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                    <TableHead className="text-right">Montant TVA</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVATEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Aucune écriture TVA trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVATEntries.map((entry) => (
                      <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50">
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
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              entry.status === "pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                                : entry.status === "declared"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                            }`}
                          >
                            {entry.status === "pending"
                              ? "En attente"
                              : entry.status === "declared"
                                ? "Déclarée"
                                : "Payée"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="declarations" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">TVA Collectée</TableHead>
                    <TableHead className="text-right">TVA Déductible</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatDeclarations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Aucune déclaration trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    vatDeclarations.map((declaration) => (
                      <TableRow key={declaration.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>{declaration.period}</TableCell>
                        <TableCell>{declaration.reference || "-"}</TableCell>
                        <TableCell className="text-right">{declaration.totalCollected.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{declaration.totalDeductible.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right font-medium">{declaration.netVAT.toFixed(2)} DH</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              declaration.status === "draft"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                                : declaration.status === "submitted"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                            }`}
                          >
                            {declaration.status === "draft"
                              ? "Brouillon"
                              : declaration.status === "submitted"
                                ? "Soumise"
                                : "Payée"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Voir
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* VAT Declaration Form Dialog */}
      <VATDeclarationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddDeclaration}
        vatEntries={vatEntries}
      />
    </div>
  )
}
