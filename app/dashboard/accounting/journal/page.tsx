"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Filter, Download, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { JournalEntryForm } from "@/components/journal-entry-form"

interface JournalEntry {
  id: string
  date: string
  reference: string
  description: string
  entries: {
    accountNumber: string
    accountName: string
    debit: number
    credit: number
  }[]
  status: "draft" | "posted" | "validated"
  createdBy: string
  createdAt: string
  total: number
  hasWarning?: boolean
}

export default function JournalPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Load journal entries for the current company
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

    // Get journal entries for this company
    const journalEntriesData = localStorage.getItem(`journal_entries_${companyId}`)
    if (journalEntriesData) {
      setJournalEntries(JSON.parse(journalEntriesData))
    } else {
      // Initialize with sample data if no entries exist
      const sampleEntries = generateSampleJournalEntries()
      localStorage.setItem(`journal_entries_${companyId}`, JSON.stringify(sampleEntries))
      setJournalEntries(sampleEntries)
    }
  }, [router])

  const generateSampleJournalEntries = (): JournalEntry[] => {
    return [
      {
        id: "je-001",
        date: "2024-04-15",
        reference: "JE-2024-001",
        description: "Achat de fournitures de bureau",
        entries: [
          {
            accountNumber: "6174",
            accountName: "Fournitures de bureau",
            debit: 1200,
            credit: 0,
          },
          {
            accountNumber: "4456",
            accountName: "TVA déductible",
            debit: 240,
            credit: 0,
          },
          {
            accountNumber: "5141",
            accountName: "Banque",
            debit: 0,
            credit: 1440,
          },
        ],
        status: "posted",
        createdBy: "John Doe",
        createdAt: "2024-04-15T10:30:00",
        total: 1440,
      },
      {
        id: "je-002",
        date: "2024-04-10",
        reference: "JE-2024-002",
        description: "Paiement de loyer",
        entries: [
          {
            accountNumber: "6132",
            accountName: "Loyer",
            debit: 5000,
            credit: 0,
          },
          {
            accountNumber: "4456",
            accountName: "TVA déductible",
            debit: 1000,
            credit: 0,
          },
          {
            accountNumber: "5141",
            accountName: "Banque",
            debit: 0,
            credit: 6000,
          },
        ],
        status: "validated",
        createdBy: "Jane Smith",
        createdAt: "2024-04-10T14:15:00",
        total: 6000,
      },
      {
        id: "je-003",
        date: "2024-04-05",
        reference: "JE-2024-003",
        description: "Vente de services",
        entries: [
          {
            accountNumber: "5141",
            accountName: "Banque",
            debit: 12000,
            credit: 0,
          },
          {
            accountNumber: "7111",
            accountName: "Ventes de produits",
            debit: 0,
            credit: 10000,
          },
          {
            accountNumber: "4455",
            accountName: "TVA collectée",
            debit: 0,
            credit: 2000,
          },
        ],
        status: "draft",
        createdBy: "John Doe",
        createdAt: "2024-04-05T09:45:00",
        total: 12000,
        hasWarning: true,
      },
    ]
  }

  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    if (!currentCompanyId) return

    // Add the new entry to the list
    const updatedEntries = [newEntry, ...journalEntries]
    setJournalEntries(updatedEntries)

    // Save to localStorage
    localStorage.setItem(`journal_entries_${currentCompanyId}`, JSON.stringify(updatedEntries))

    // Close the form
    setIsFormOpen(false)
  }

  const filteredEntries = journalEntries.filter((entry) => {
    // Filter by search term
    const matchesSearch =
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter

    // Filter by date range
    const entryDate = new Date(entry.date)
    const matchesDateRange = !dateRange || (entryDate >= dateRange.from && entryDate <= dateRange.to)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Calculate totals
  const totalDebits = filteredEntries.reduce((sum, entry) => {
    return sum + entry.entries.reduce((entrySum, line) => entrySum + line.debit, 0)
  }, 0)

  const totalCredits = filteredEntries.reduce((sum, entry) => {
    return sum + entry.entries.reduce((entrySum, line) => entrySum + line.credit, 0)
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Journal Comptable</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle écriture
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Référence, description..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="posted">Comptabilisé</SelectItem>
                  <SelectItem value="validated">Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                Appliquer
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
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
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Débit</TableHead>
                <TableHead className="text-right">Crédit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucune écriture trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/accounting/journal/${entry.id}`)}
                  >
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {entry.hasWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {entry.reference}
                      </div>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          entry.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                            : entry.status === "posted"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                        }`}
                      >
                        {entry.status === "draft" ? "Brouillon" : entry.status === "posted" ? "Comptabilisé" : "Validé"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.entries.reduce((sum, line) => sum + line.debit, 0).toFixed(2)} DH
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.entries.reduce((sum, line) => sum + line.credit, 0).toFixed(2)} DH
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right">{totalDebits.toFixed(2)} DH</TableCell>
                <TableCell className="text-right">{totalCredits.toFixed(2)} DH</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Journal Entry Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nouvelle écriture comptable</DialogTitle>
            <DialogDescription>
              Créez une nouvelle écriture comptable. Assurez-vous que les débits et crédits sont équilibrés.
            </DialogDescription>
          </DialogHeader>
          <JournalEntryForm onSubmit={handleAddJournalEntry} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
