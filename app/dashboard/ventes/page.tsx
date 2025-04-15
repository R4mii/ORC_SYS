import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Search } from "lucide-react"

export default function VentesPage() {
  // Mock data for sales invoices
  const mockInvoices = [
    { id: "FACT-001", client: "Client A", date: "2023-05-10", amount: 2500.0, status: "payé", category: "Services" },
    {
      id: "FACT-002",
      client: "Client B",
      date: "2023-05-18",
      amount: 1800.5,
      status: "en attente",
      category: "Produits",
    },
    {
      id: "FACT-003",
      client: "Client C",
      date: "2023-05-22",
      amount: 3200.75,
      status: "en retard",
      category: "Consultation",
    },
    { id: "FACT-004", client: "Client D", date: "2023-05-30", amount: 950.25, status: "payé", category: "Maintenance" },
    {
      id: "FACT-005",
      client: "Client E",
      date: "2023-06-05",
      amount: 4250.0,
      status: "en attente",
      category: "Services",
    },
  ]

  // Column definitions for the data table
  const columns = [
    { header: "N° Facture", accessorKey: "id" },
    { header: "Client", accessorKey: "client" },
    { header: "Date", accessorKey: "date" },
    { header: "Montant (€)", accessorKey: "amount", cell: (info: any) => `${info.getValue().toFixed(2)} €` },
    {
      header: "Statut",
      accessorKey: "status",
      cell: (info: any) => {
        const status = info.getValue()
        let className = "px-2 py-1 rounded text-xs font-medium"

        if (status === "payé") {
          className += " bg-green-100 text-green-800"
        } else if (status === "en attente") {
          className += " bg-yellow-100 text-yellow-800"
        } else if (status === "en retard") {
          className += " bg-red-100 text-red-800"
        }

        return <span className={className}>{status}</span>
      },
    },
    { header: "Catégorie", accessorKey: "category" },
    {
      header: "Actions",
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Voir
          </Button>
          <Button variant="outline" size="sm">
            Éditer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Factures de Ventes</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Nouvelle Facture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Ventes</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,701.50 €</div>
            <p className="text-xs text-muted-foreground mt-1">+8% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en Attente</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,050.50 €</div>
            <p className="text-xs text-muted-foreground mt-1">2 factures en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en Retard</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,200.75 €</div>
            <p className="text-xs text-muted-foreground mt-1">1 facture en retard</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures de Ventes</CardTitle>
          <CardDescription>Gérez et suivez toutes vos factures de ventes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Rechercher une facture..." className="pl-8 w-full" />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="products">Produits</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <DateRangePicker />
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <EnhancedDataTable data={mockInvoices} columns={columns} />
        </CardContent>
      </Card>
    </div>
  )
}
