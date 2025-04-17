"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, Search, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/date-range-picker"

interface Account {
  id: string
  number: string
  name: string
  type: string
  balance: number
}

interface LedgerEntry {
  id: string
  date: string
  journalRef: string
  description: string
  debit: number
  credit: number
  balance: number
}

interface AccountLedger {
  account: Account
  entries: LedgerEntry[]
}

export default function LedgerPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [ledgers, setLedgers] = useState<Record<string, LedgerEntry[]>>({})
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({})

  // Load accounts and ledger entries for the current company
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

    // Get accounts for this company
    const accountsData = localStorage.getItem(`chart_of_accounts_${companyId}`)
    if (accountsData) {
      const parsedAccounts = JSON.parse(accountsData)
      setAccounts(parsedAccounts)

      // Initialize expanded state for all accounts
      const initialExpandedState: Record<string, boolean> = {}
      parsedAccounts.forEach((account: Account) => {
        initialExpandedState[account.id] = false
      })
      setExpandedAccounts(initialExpandedState)
    }

    // Get ledger entries for this company
    const ledgerData = localStorage.getItem(`ledger_entries_${companyId}`)
    if (ledgerData) {
      setLedgers(JSON.parse(ledgerData))
    } else {
      // Generate sample ledger entries if none exist
      const sampleLedgers = generateSampleLedgerEntries()
      localStorage.setItem(`ledger_entries_${companyId}`, JSON.stringify(sampleLedgers))
      setLedgers(sampleLedgers)
    }
  }, [router])

  const generateSampleLedgerEntries = (): Record<string, LedgerEntry[]> => {
    // This would normally be generated from journal entries
    // For demo purposes, we'll create some sample data
    return {
      // Bank account
      "1": [
        {
          id: "l1",
          date: "2024-04-01",
          journalRef: "JE-2024-001",
          description: "Solde initial",
          debit: 100000,
          credit: 0,
          balance: 100000,
        },
        {
          id: "l2",
          date: "2024-04-05",
          journalRef: "JE-2024-003",
          description: "Vente de services",
          debit: 12000,
          credit: 0,
          balance: 112000,
        },
        {
          id: "l3",
          date: "2024-04-10",
          journalRef: "JE-2024-002",
          description: "Paiement de loyer",
          debit: 0,
          credit: 6000,
          balance: 106000,
        },
        {
          id: "l4",
          date: "2024-04-15",
          journalRef: "JE-2024-001",
          description: "Achat de fournitures de bureau",
          debit: 0,
          credit: 1440,
          balance: 104560,
        },
      ],
      // Suppliers account
      "5": [
        {
          id: "l5",
          date: "2024-04-01",
          journalRef: "JE-2024-004",
          description: "Solde initial",
          debit: 0,
          credit: 25000,
          balance: 25000,
        },
        {
          id: "l6",
          date: "2024-04-12",
          journalRef: "JE-2024-005",
          description: "Facture fournisseur ABC",
          debit: 0,
          credit: 8500,
          balance: 33500,
        },
        {
          id: "l7",
          date: "2024-04-20",
          journalRef: "JE-2024-006",
          description: "Paiement fournisseur XYZ",
          debit: 12000,
          credit: 0,
          balance: 21500,
        },
      ],
      // Office supplies expense
      "12": [
        {
          id: "l8",
          date: "2024-04-15",
          journalRef: "JE-2024-001",
          description: "Achat de fournitures de bureau",
          debit: 1200,
          credit: 0,
          balance: 1200,
        },
        {
          id: "l9",
          date: "2024-04-22",
          journalRef: "JE-2024-007",
          description: "Achat de papeterie",
          debit: 800,
          credit: 0,
          balance: 2000,
        },
      ],
    }
  }

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts({
      ...expandedAccounts,
      [accountId]: !expandedAccounts[accountId],
    })
  }

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSelected = !selectedAccount || account.id === selectedAccount

    return matchesSearch && matchesSelected
  })

  // Filter ledger entries based on date range
  const getFilteredLedgerEntries = (accountId: string) => {
    const entries = ledgers[accountId] || []

    if (!dateRange) return entries

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= dateRange.from && entryDate <= dateRange.to
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Grand Livre</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Numéro, nom de compte..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Compte</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Tous les comptes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.number} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Numéro</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Débit</TableHead>
                <TableHead className="text-right">Crédit</TableHead>
                <TableHead className="text-right">Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Aucun compte trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => {
                  const accountEntries = getFilteredLedgerEntries(account.id)
                  const totalDebit = accountEntries.reduce((sum, entry) => sum + entry.debit, 0)
                  const totalCredit = accountEntries.reduce((sum, entry) => sum + entry.credit, 0)
                  const balance =
                    accountEntries.length > 0 ? accountEntries[accountEntries.length - 1].balance : account.balance

                  return (
                    <>
                      <TableRow
                        key={account.id}
                        className="bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => toggleAccount(account.id)}
                      >
                        <TableCell className="font-medium">{account.number}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {expandedAccounts[account.id] ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            {account.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{totalDebit.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right font-medium">{totalCredit.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right font-medium">{balance.toFixed(2)} DH</TableCell>
                      </TableRow>

                      {expandedAccounts[account.id] && (
                        <>
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={5} className="p-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead className="w-[120px]">Référence</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Débit</TableHead>
                                    <TableHead className="text-right">Crédit</TableHead>
                                    <TableHead className="text-right">Solde</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {accountEntries.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        Aucune écriture pour cette période
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    accountEntries.map((entry) => (
                                      <TableRow key={entry.id} className="hover:bg-muted/30">
                                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                                            {entry.journalRef}
                                          </div>
                                        </TableCell>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="text-right">
                                          {entry.debit > 0 ? entry.debit.toFixed(2) + " DH" : ""}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {entry.credit > 0 ? entry.credit.toFixed(2) + " DH" : ""}
                                        </TableCell>
                                        <TableCell className="text-right">{entry.balance.toFixed(2)} DH</TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
