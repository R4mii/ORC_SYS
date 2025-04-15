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

// Mock data for sales invoices
const mockInvoices = [
  {
    id: "INV-VNT-001",
    client: "Entreprise Martin",
    date: "2023-04-10",
    amount: 2500.0,
    status: "paid",
    dueDate: "2023-05-10",
    category: "Services",
  },
  {
    id: "INV-VNT-002",
    client: "Société Dupont",
    date: "2023-04-12",
    amount: 1850.75,
    status: "pending",
    dueDate: "2023-05-12",
    category: "Produits",
  },
  {
    id: "INV-VNT-003",
    client: "Groupe Bernard",
    date: "2023-04-15",
    amount: 3200.5,
    status: "overdue",
    dueDate: "2023-05-15",
    category: "Conseil",
  },
  {
    id: "INV-VNT-004",
    client: "Compagnie Leroy",
    date: "2023-04-18",
    amount: 950.25,
    status: "paid",
    dueDate: "2023-05-18",
    category: "Formation",
  },
  {
    id: "INV-VNT-005",
    client: "Association Moreau",
    date: "2023-04-22",
    amount: 1750.0,
    status: "pending",
    dueDate: "2023-05-22",
    category: "Services",
  },
]

export default function VentesPage() {
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
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesCategory = categoryFilter === "all" || invoice.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleInvoiceClick = (id: string) => {
    router.push(`/dashboard/ventes/${id}`)
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
          <h2 className="text-2xl font-bold tracking-tight">Factures de Ventes</h2>
          <p className="text-muted-foreground">Gérez et suivez toutes vos factures de ventes</p>
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
            <CardTitle className="text-sm font-medium">Total des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))
              )}
            </div>
            <p className="text-xs text-muted-foreground">+8.5% par rapport au mois dernier</p>
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
          <CardTitle>Factures de Ventes</CardTitle>
          <CardDescription>Liste de toutes vos factures de ventes avec leur statut et détails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex items-center gap-2 md:w-1/3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
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
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Produits">Produits</SelectItem>
                    <SelectItem value="Conseil">Conseil</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
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
                      <TableHead>Client</TableHead>
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
                          <TableCell>{invoice.client}</TableCell>
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
