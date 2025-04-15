import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Search } from "lucide-react"

export default function AchatsPage() {
  // Mock data for purchase invoices
  const mockInvoices = [
    {
      id: "INV-001",
      supplier: "Fournisseur A",
      date: "2023-05-15",
      amount: 1250.75,
      status: "payé",
      category: "Matériel",
    },
    {
      id: "INV-002",
      supplier: "Fournisseur B",
      date: "2023-05-20",
      amount: 780.5,
      status: "en attente",
      category: "Services",
    },
    {
      id: "INV-003",
      supplier: "Fournisseur C",
      date: "2023-05-25",
      amount: 2340.0,
      status: "en retard",
      category: "Équipement",
    },
    {
      id: "INV-004",
      supplier: "Fournisseur D",
      date: "2023-06-01",
      amount: 450.25,
      status: "payé",
      category: "Fournitures",
    },
    {
      id: "INV-005",
      supplier: "Fournisseur E",
      date: "2023-06-05",
      amount: 1875.3,
      status: "en attente",
      category: "Matériel",
    },
  ]

  // Column definitions for the data table
  const columns = [
    { header: "N° Facture", accessorKey: "id" },
    { header: "Fournisseur", accessorKey: "supplier" },
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
        <h1 className="text-3xl font-bold">Factures d'Achats</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Nouvelle Facture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Achats</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,696.80 €</div>
            <p className="text-xs text-muted-foreground mt-1">+12% par rapport au mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en Attente</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,655.80 €</div>
            <p className="text-xs text-muted-foreground mt-1">2 factures en attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Factures en Retard</CardTitle>
            <CardDescription>Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,340.00 €</div>
            <p className="text-xs text-muted-foreground mt-1">1 facture en retard</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures d'Achats</CardTitle>
          <CardDescription>Gérez et suivez toutes vos factures d'achats</CardDescription>
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
                    <SelectItem value="material">Matériel</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="equipment">Équipement</SelectItem>
                    <SelectItem value="supplies">Fournitures</SelectItem>
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
