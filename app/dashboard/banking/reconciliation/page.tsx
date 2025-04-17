"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, Search, Check, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { DatePickerWithRange } from "@/components/date-range-picker"

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "debit" | "credit"
  reference: string
  reconciled: boolean
  matchedTransactionId?: string
}

interface AccountTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "debit" | "credit"
  reference: string
  reconciled: boolean
  matchedTransactionId?: string
}

export default function BankReconciliationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([])
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>("1") // Default to first account
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(),
  })
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<string | null>(null)
  const [selectedAccountTransaction, setSelectedAccountTransaction] = useState<string | null>(null)

  // Load data for the current company
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
      // Filter only bank accounts
      const bankAccounts = parsedAccounts.filter((acc: any) => 
        acc.number.startsWith("514") || acc.number.startsWith("516")
      )
      setAccounts(bankAccounts)
    }

    // Get bank transactions for this company
    const bankTransactionsData = localStorage.getItem(`bank_transactions_${companyId}`)
    if (bankTransactionsData) {
      setBankTransactions(JSON.parse(bankTransactionsData))
    } else {
      // Generate sample data if none exists
      const sampleTransactions = generateSampleBankTransactions()
      localStorage.setItem(`bank_transactions_${companyId}`, JSON.stringify(sampleTransactions))
      setBankTransactions(sampleTransactions)
    }

    // Get account transactions for this company
    const accountTransactionsData = localStorage.getItem(`account_transactions_${companyId}`)
    if (accountTransactionsData) {
      setAccountTransactions(JSON.parse(accountTransactionsData))
    } else {
      // Generate sample data if none exists
      const sampleTransactions = generateSampleAccountTransactions()
      localStorage.setItem(`account_transactions_${companyId}`, JSON.stringify(sampleTransactions))
      setAccountTransactions(sampleTransactions)
    }
  }, [router])

  const generateSampleBankTransactions = (): BankTransaction[] => {
    return [
      {
        id: "bt1",
        date: "2024-04-01",
        description: "Virement client ABC",
        amount: 12000,
        type: "credit",
        reference: "VIR123456",
        reconciled: true,
        matchedTransactionId: "at1"
      },
      {
        id: "bt2",
        date: "2024-04-05",
        description: "Paiement fournisseur XYZ",
        amount: 5000,
        type: "debit",
        reference: "VIR789012",
        reconciled: true,
        matchedTransactionId: "at2"
      },
      {
        id: "bt3",
        date: "2024-04-10",
        description: "Virement client DEF",
        amount: 8500,
        type: "credit",
        reference: "VIR345678",
        reconciled: false
      },
      {
        id: "bt4",
        date: "2024-04-15",
        description: "Paiement loyer",
        amount: 6000,
        type: "debit",
        reference: "VIR901234",
        reconciled: false
      },
      {
        id: "bt5",
        date: "2024-04-20",
        description: "Frais bancaires",
        amount: 150,
        type: "debit",
        reference: "FRAIS042024",
        reconciled: false
      }
    ]
  }

  const generateSampleAccountTransactions = (): AccountTransaction[] => {
    return [
      {
        id: "at1",
        date: "2024-04-01",
        description: "Facture client ABC",
        amount: 12000,
        type: "credit",
        reference: "FAC-2024-001",
        reconciled: true,
        matchedTransactionId: "bt1"
      },
      {
        id: "at2",
        date: "2024-04-05",
        description: "Paiement fournisseur XYZ",
        amount: 5000,
        type: "debit",
        reference: "FAC-2024-002",
        reconciled: true,
        matchedTransactionId: "bt2"
      },
      {
        id: "at3",
        date: "2024-04-10",
        description: "Facture client DEF",
        amount: 8500,
        type: "credit",
        reference: "FAC-2024-003",
        reconciled: false
      },
      {
        id: "at4",
        date: "2024-04-12",
        description: "Paiement salaires",
        amount: 15000,
        type: "debit",
        reference: "SAL-2024-04",
        reconciled: false
      },
      {
        id: "at5",
        date: "2024-04-18",
        description: "Facture client GHI",
        amount: 6500,
        type: "credit",
        reference: "FAC-2024-004",
        reconciled: false
      }
    ]
  }

  // Filter transactions based on search term and date range
  const filteredBankTransactions = bankTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateRange || (
      new Date(transaction.date) >= dateRange.from && 
      new Date(transaction.date) <= dateRange.to
    )
    
    return matchesSearch && matchesDate
  })

  const filteredAccountTransactions = accountTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateRange || (
      new Date(transaction.date) >= dateRange.from && 
      new Date(transaction.date) <= dateRange.to
    )
    
    return matchesSearch && matchesDate
  })

  // Calculate reconciliation stats
  const totalBankTransactions = filteredBankTransactions.length
  const reconciledBankTransactions = filteredBankTransactions.filter(t => t.reconciled).length
  const reconciledPercentage = totalBankTransactions > 0 
    ? (reconciledBankTransactions / totalBankTransactions) * 100 
    : 0

  // Handle reconciliation
  const handleReconcile = () => {
    if (!selectedBankTransaction || !selectedAccountTransaction || !currentCompanyId) return

    // Update bank transaction
    const updatedBankTransactions = bankTransactions.map(transaction => {
      if (transaction.id === selectedBankTransaction) {
        return {
          ...transaction,
          reconciled: true,
          matchedTransactionId: selectedAccountTransaction
        }
      }
      return transaction
    })
    
    // Update account transaction
    const updatedAccountTransactions = accountTransactions.map(transaction => {
      if (transaction.id === selectedAccountTransaction) {
        return {
          ...transaction,
          reconciled: true,
          matchedTransactionId: selectedBankTransaction
        }
      }
      return transaction
    })
    
    // Save to localStorage
    localStorage.setItem(`bank_transactions_${currentCompanyId}`, JSON.stringify(updatedBankTransactions))
    localStorage.setItem(`account_transactions_${currentCompanyId}`, JSON.stringify(updatedAccountTransactions))
    
    // Update state
    setBankTransactions(updatedBankTransactions)
    setAccountTransactions(updatedAccountTransactions)
    
    // Reset selection
    setSelectedBankTransaction(null)
    setSelectedAccountTransaction(null)
  }

  // Handle unreconciliation
  const handleUnreconcile = (bankTransactionId: string, accountTransactionId: string) => {
    if (!currentCompanyId) return

    // Update bank transaction
    const updatedBankTransactions = bankTransactions.map(transaction => {
      if (transaction.id === bankTransactionId) {
        return {
          ...transaction,
          reconciled: false,
          matchedTransactionId: undefined
        }
      }
      return transaction
    })
    
    // Update account transaction
    const updatedAccountTransactions = accountTransactions.map(transaction => {
      if (transaction.id === accountTransactionId) {
        return {
          ...transaction,
          reconciled: false,
          matchedTransactionId: undefined
        }
      }
      return transaction
    })
    
    // Save to localStorage
    localStorage.setItem(`bank_transactions_${currentCompanyId}`, JSON.stringify(updatedBankTransactions))
    localStorage.setItem(`account_transactions_${currentCompanyId}`, JSON.stringify(updatedAccountTransactions))
    
    // Update state
    setBankTransactions(updatedBankTransactions)
    setAccountTransactions(updatedAccountTransactions)
  }

  // Check if reconciliation is possible
  const canReconcile = () => {
    if (!selectedBankTransaction || !selectedAccountTransaction) return false
    
    const bankTransaction = bankTransactions.find(t => t.id === selectedBankTransaction)
    const accountTransaction = accountTransactions.find(t => t.id === selectedAccountTransaction)
    
    if (!bankTransaction || !accountTransaction) return false
    
    // Check if amounts match
    return bankTransaction.amount === accountTransaction.amount && 
           bankTransaction.type === accountTransaction.type
  }

  // Get the selected account name
  const getSelectedAccountName = () => {
    const account = accounts.find(acc => acc.id === selectedAccount)
    return account ? `${account.number} - ${account.name}` : "Compte bancaire"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rapprochement bancaire</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Compte bancaire</Label>
              <Select 
                value={selectedAccount} 
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.number} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Période</Label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Description, référence..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>État du rapprochement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{getSelectedAccountName()}</p>
                  <p className="text-xs text-muted-foreground">
                    {reconciledBankTransactions} sur {totalBankTransactions} transactions rapprochées
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {reconciledPercentage.toFixed(0)}%
                </div>
              </div>
              
              <Progress value={reconciledPercentage} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Solde bancaire</p>
                  <p className="text-lg font-medium">120,000.00 DH</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Solde comptable</p>
                  <p className="text-lg font-medium">118,500.00 DH</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Écart</p>
                  <p className="text-lg font-medium text-amber-500">1,500.00 DH</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleReconcile}
                disabled={!canReconcile()}
              >
                <Check className="mr-2 h-4 w-4" />
                Rapprocher les transactions
              </Button>
              
              <Button variant="outline" className="w-full">
                Rapprochement automatique
              </Button>
              
              <Button variant="outline" className="w-full">
                Créer une règle de rapprochement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transactions bancaires</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBankTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucune transaction bancaire trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBankTransactions.map(transaction => {
                    const isReconciled = transaction.reconciled
                    const isSelected = selectedBankTransaction === transaction.id
                    
                    return (
                      <TableRow 
                        key={transaction.id} 
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          isSelected && "bg-muted"
                        )}
                        onClick={() => {
                          if (!isReconciled) {
                            setSelectedBankTransaction(isSelected ? null : transaction.id)
                          }
                        }}
                      >
                        <TableCell>
                          {!isReconciled && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => {
                                setSelectedBankTransaction(isSelected ? null : transaction.id)
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {isReconciled && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (transaction.matchedTransactionId) {
                                  handleUnreconcile(transaction.id, transaction.matchedTransactionId)
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toFixed(2)} DH
                        </TableCell>
                        <TableCell>
                          {isReconciled ? (
                            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                              Rapproché
                            </div>
                          ) : (
                            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                              En attente
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3


Now, let's create the Bank Rules page:

\
