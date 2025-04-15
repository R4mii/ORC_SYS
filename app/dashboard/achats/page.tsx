"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for purchase invoices
const mockInvoices = [
  {
    id: "INV-ACH-001",
    vendor: "Fournitures Bureau Pro",
    date: "2023-04-15",
    amount: 1250.75,
    status: "paid",
    dueDate: "2023-05-15",
    category: "Fournitures",
  },
  {
    id: "INV-ACH-002",
    vendor: "Tech Solutions Inc.",
    date: "2023-04-18",
    amount: 3450.0,
    status: "pending",
    dueDate: "2023-05-18",
    category: "Équipement",
  },
  {
    id: "INV-ACH-003",
    vendor: "Services Maintenance",
    date: "2023-04-22",
    amount: 875.5,
    status: "overdue",
    dueDate: "2023-05-22",
    category: "Services",
  },
  {
    id: "INV-ACH-004",
    vendor: "Logistique Express",
    date: "2023-04-25",
    amount: 560.25,
    status: "paid",
    dueDate: "2023-05-25",
    category: "Transport",
  },
  {
    id: "INV-ACH-005",
    vendor: "Consulting Experts",
    date: "2023-04-28",
    amount: 2100.0,
    status: "pending",
    dueDate: "2023-05-28",
    category: "Conseil",
  },
]

export default function AchatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter invoices based on search term and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesCategory = categoryFilter === "all" || invoice.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleInvoiceClick = (id: string) => {
    router.push(`/dashboard/achats/${id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Payée</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En attente</Badge>
      case "overdue":
        return <Badge className="bg-red-500 hover:bg-red-600">En retard</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR").format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Factures d'Achats</h2>
          <p className="text-muted-foreground">Gérez et suivez toutes vos factures d'achats</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des achats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))
              )}
            </div>
            <p className="text-xs text-muted-foreground">+12.2% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-24" /> : invoices.filter((i) => i.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                formatCurrency(
                  invoices.filter((i) => i.status === "pending").reduce((sum, invoice) => sum + invoice.amount, 0),
                )
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-24" /> : invoices.filter((i) => i.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                formatCurrency(
                  invoices.filter((i) => i.status === "overdue").reduce((sum, invoice) => sum + invoice.amount, 0),
                )
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factures d'Achats</CardTitle>
          <CardDescription>Liste de toutes vos factures d'achats avec leur statut et détails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex items-center gap-2 md:w-1/3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="Fournitures">Fournitures</SelectItem>
                    <SelectItem value="Équipement">Équipement</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Conseil">Conseil</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto">
                  <DateRangePicker />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Aucune facture trouvée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleInvoiceClick(invoice.id)}
                        >
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.vendor}</TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>{invoice.category}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
