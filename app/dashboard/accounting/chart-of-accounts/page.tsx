"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Filter, Download, ChevronRight, ChevronDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AccountForm } from "@/components/account-form"

interface Account {
  id: string
  number: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  parentId?: string
  balance: number
  isActive: boolean
  description?: string
}

export default function ChartOfAccountsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    asset: true,
    liability: true,
    equity: true,
    revenue: true,
    expense: true,
  })

  // Load accounts for the current company
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
      setAccounts(JSON.parse(accountsData))
    } else {
      // Initialize with sample data if no accounts exist
      const sampleAccounts = generateSampleAccounts()
      localStorage.setItem(`chart_of_accounts_${companyId}`, JSON.stringify(sampleAccounts))
      setAccounts(sampleAccounts)
    }
  }, [router])

  const generateSampleAccounts = (): Account[] => {
    return [
      // Asset accounts
      {
        id: "1",
        number: "5141",
        name: "Banque",
        type: "asset",
        balance: 120000,
        isActive: true,
        description: "Compte bancaire principal",
      },
      {
        id: "2",
        number: "5161",
        name: "Caisse",
        type: "asset",
        balance: 5000,
        isActive: true,
        description: "Caisse pour les petites dépenses",
      },
      {
        id: "3",
        number: "4111",
        name: "Clients",
        type: "asset",
        balance: 45000,
        isActive: true,
        description: "Créances clients",
      },
      {
        id: "4",
        number: "4456",
        name: "TVA déductible",
        type: "asset",
        balance: 8000,
        isActive: true,
        description: "TVA sur achats",
      },

      // Liability accounts
      {
        id: "5",
        number: "4011",
        name: "Fournisseurs",
        type: "liability",
        balance: 35000,
        isActive: true,
        description: "Dettes fournisseurs",
      },
      {
        id: "6",
        number: "4455",
        name: "TVA collectée",
        type: "liability",
        balance: 12000,
        isActive: true,
        description: "TVA sur ventes",
      },
      {
        id: "7",
        number: "4441",
        name: "État - impôts sur les bénéfices",
        type: "liability",
        balance: 25000,
        isActive: true,
      },

      // Equity accounts
      { id: "8", number: "1111", name: "Capital social", type: "equity", balance: 100000, isActive: true },
      { id: "9", number: "1181", name: "Report à nouveau", type: "equity", balance: 50000, isActive: true },

      // Revenue accounts
      { id: "10", number: "7111", name: "Ventes de produits", type: "revenue", balance: 180000, isActive: true },
      { id: "11", number: "7121", name: "Ventes de services", type: "revenue", balance: 120000, isActive: true },

      // Expense accounts
      { id: "12", number: "6174", name: "Fournitures de bureau", type: "expense", balance: 8000, isActive: true },
      { id: "13", number: "6132", name: "Loyer", type: "expense", balance: 36000, isActive: true },
      { id: "14", number: "6241", name: "Transport sur achats", type: "expense", balance: 5000, isActive: true },
      { id: "15", number: "6311", name: "Salaires", type: "expense", balance: 120000, isActive: true },
    ]
  }

  const handleAddAccount = (newAccount: Account) => {
    if (!currentCompanyId) return

    // Add the new account to the list
    const updatedAccounts = editingAccount
      ? accounts.map((acc) => (acc.id === editingAccount.id ? newAccount : acc))
      : [...accounts, newAccount]

    setAccounts(updatedAccounts)

    // Save to localStorage
    localStorage.setItem(`chart_of_accounts_${currentCompanyId}`, JSON.stringify(updatedAccounts))

    // Close the form and reset editing state
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  const handleDeleteAccount = (accountId: string) => {
    if (!currentCompanyId) return

    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.")) {
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId)
      setAccounts(updatedAccounts)
      localStorage.setItem(`chart_of_accounts_${currentCompanyId}`, JSON.stringify(updatedAccounts))
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    })
  }

  // Filter accounts based on search term and type filter
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || account.type === typeFilter

    return matchesSearch && matchesType
  })

  // Group accounts by type
  const accountsByType: Record<string, Account[]> = {
    asset: filteredAccounts.filter((acc) => acc.type === "asset"),
    liability: filteredAccounts.filter((acc) => acc.type === "liability"),
    equity: filteredAccounts.filter((acc) => acc.type === "equity"),
    revenue: filteredAccounts.filter((acc) => acc.type === "revenue"),
    expense: filteredAccounts.filter((acc) => acc.type === "expense"),
  }

  // Calculate totals by type
  const totalsByType = {
    asset: accountsByType.asset.reduce((sum, acc) => sum + acc.balance, 0),
    liability: accountsByType.liability.reduce((sum, acc) => sum + acc.balance, 0),
    equity: accountsByType.equity.reduce((sum, acc) => sum + acc.balance, 0),
    revenue: accountsByType.revenue.reduce((sum, acc) => sum + acc.balance, 0),
    expense: accountsByType.expense.reduce((sum, acc) => sum + acc.balance, 0),
  }

  const typeLabels: Record<string, string> = {
    asset: "Actifs",
    liability: "Passifs",
    equity: "Capitaux propres",
    revenue: "Produits",
    expense: "Charges",
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Plan Comptable</h1>
        <Button
          onClick={() => {
            setEditingAccount(null)
            setIsFormOpen(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau compte
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
              <Label htmlFor="type">Type de compte</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="asset">Actifs</SelectItem>
                  <SelectItem value="liability">Passifs</SelectItem>
                  <SelectItem value="equity">Capitaux propres</SelectItem>
                  <SelectItem value="revenue">Produits</SelectItem>
                  <SelectItem value="expense">Charges</SelectItem>
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
                <TableHead className="w-[180px]">Numéro</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(accountsByType).map(
                (type) =>
                  accountsByType[type].length > 0 && (
                    <>
                      <TableRow
                        key={type}
                        className="bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => toggleCategory(type)}
                      >
                        <TableCell colSpan={3} className="font-medium">
                          <div className="flex items-center">
                            {expandedCategories[type] ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            {typeLabels[type]}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{totalsByType[type].toFixed(2)} DH</TableCell>
                        <TableCell></TableCell>
                      </TableRow>

                      {expandedCategories[type] &&
                        accountsByType[type].map((account) => (
                          <TableRow key={account.id} className="hover:bg-muted/50">
                            <TableCell>{account.number}</TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  account.type === "asset"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                    : account.type === "liability"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                                      : account.type === "equity"
                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500"
                                        : account.type === "revenue"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                                }`}
                              >
                                {typeLabels[account.type]}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{account.balance.toFixed(2)} DH</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditAccount(account)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAccount(account.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  ),
              )}

              {filteredAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Aucun compte trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Account Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Modifier le compte" : "Nouveau compte"}</DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Modifiez les informations du compte comptable."
                : "Créez un nouveau compte dans le plan comptable."}
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            onSubmit={handleAddAccount}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingAccount(null)
            }}
            initialData={editingAccount}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
