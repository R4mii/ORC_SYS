"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Download, Printer, FileText, BarChart3, Calendar } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface Invoice {
  id: string
  name: string
  invoiceNumber: string
  partner: string
  invoiceDate: string
  dueDate: string
  createdAt: string
  amount: number
  amountWithTax: number
  type: string
  paymentStatus: string
  declarationStatus: string
  status: string
  documentType?: string
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invoices")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [filters, setFilters] = useState({
    documentType: "all",
    status: "all",
  })
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null)

  // Load invoices from localStorage on component mount
  useEffect(() => {
    // Only run this code in the browser
    if (typeof window === "undefined") return

    // Get the selected company from localStorage
    const companyId = localStorage.getItem("selectedCompanyId")
    if (!companyId) {
      return
    }

    setCurrentCompanyId(companyId)

    // Get all document types
    const documentTypes = ["purchases", "sales", "cashReceipts", "bankStatements"]
    let allInvoices: Invoice[] = []

    documentTypes.forEach((type) => {
      const documentsJson = localStorage.getItem(`${type}_${companyId}`)
      if (documentsJson) {
        const documents = JSON.parse(documentsJson)
        // Add document type to each invoice
        const typedDocuments = documents.map((doc: Invoice) => ({
          ...doc,
          documentType: type,
        }))
        allInvoices = [...allInvoices, ...typedDocuments]
      }
    })

    setInvoices(allInvoices)
    setFilteredInvoices(allInvoices)
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...invoices]

    // Filter by document type
    if (filters.documentType !== "all") {
      filtered = filtered.filter((invoice) => invoice.documentType === filters.documentType)
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === filters.status)
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((invoice) => {
        if (!invoice.invoiceDate) return true

        const parts = invoice.invoiceDate.split("/")
        if (parts.length !== 3) return true

        const invoiceDate = new Date(
          Number.parseInt(parts[2]),
          Number.parseInt(parts[1]) - 1,
          Number.parseInt(parts[0]),
        )

        return invoiceDate >= dateRange.from! && invoiceDate <= dateRange.to!
      })
    }

    setFilteredInvoices(filtered)
  }, [filters, dateRange, invoices])

  // Export to CSV
  const exportToCSV = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucune donnée à exporter.",
        variant: "destructive",
      })
      return
    }

    // Create CSV header
    const headers = ["Numéro", "Fournisseur/Client", "Date", "Montant HT", "Montant TTC", "Statut", "Type"]

    // Create CSV rows
    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.partner,
      invoice.invoiceDate,
      invoice.amount,
      invoice.amountWithTax,
      invoice.status,
      invoice.documentType === "purchases"
        ? "Achat"
        : invoice.documentType === "sales"
          ? "Vente"
          : invoice.documentType === "cashReceipts"
            ? "Bon de caisse"
            : "Relevé bancaire",
    ])

    // Combine header and rows
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `rapport_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export réussi",
      description: "Le rapport a été exporté avec succès au format CSV.",
    })
  }

  // Export to PDF
  const exportToPDF = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucune donnée à exporter.",
        variant: "destructive",
      })
      return
    }

    // Create PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text("Rapport des factures", 14, 22)

    // Add date range if selected
    if (dateRange.from && dateRange.to) {
      doc.setFontSize(12)
      doc.text(`Période: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30)
    }

    // Prepare table data
    const tableColumn = ["Numéro", "Fournisseur/Client", "Date", "Montant HT", "Montant TTC", "Statut", "Type"]
    const tableRows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber,
      invoice.partner,
      invoice.invoiceDate,
      `${invoice.amount} DH`,
      `${invoice.amountWithTax} DH`,
      invoice.status,
      invoice.documentType === "purchases"
        ? "Achat"
        : invoice.documentType === "sales"
          ? "Vente"
          : invoice.documentType === "cashReceipts"
            ? "Bon de caisse"
            : "Relevé bancaire",
    ])

    // Add table to PDF
    // @ts-ignore - jspdf-autotable types are not properly recognized
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Save PDF
    doc.save(`rapport_${new Date().toISOString().split("T")[0]}.pdf`)

    toast({
      title: "Export réussi",
      description: "Le rapport a été exporté avec succès au format PDF.",
    })
  }

  // Print report
  const printReport = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Aucune donnée à imprimer",
        description: "Il n'y a aucune donnée à imprimer.",
        variant: "destructive",
      })
      return
    }

    // Create a printable version of the table
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Erreur d'impression",
        description:
          "Impossible d'ouvrir la fenêtre d'impression. Veuillez vérifier les paramètres de votre navigateur.",
        variant: "destructive",
      })
      return
    }

    // Create HTML content
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport des factures</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2980b9; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #2980b9; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .date-range { margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Rapport des factures</h1>
          ${
            dateRange.from && dateRange.to
              ? `<div class="date-range">Période: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}</div>`
              : ""
          }
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Fournisseur/Client</th>
                <th>Date</th>
                <th>Montant HT</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices
                .map(
                  (invoice) => `
                <tr>
                  <td>${invoice.invoiceNumber || "-"}</td>
                  <td>${invoice.partner || "-"}</td>
                  <td>${invoice.invoiceDate || "-"}</td>
                  <td>${invoice.amount} DH</td>
                  <td>${invoice.amountWithTax} DH</td>
                  <td>${invoice.status}</td>
                  <td>${
                    invoice.documentType === "purchases"
                      ? "Achat"
                      : invoice.documentType === "sales"
                        ? "Vente"
                        : invoice.documentType === "cashReceipts"
                          ? "Bon de caisse"
                          : "Relevé bancaire"
                  }</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)

    toast({
      title: "Impression lancée",
      description: "La fenêtre d'impression a été ouverte.",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button size="sm" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={filters.documentType}
            onValueChange={(value) => setFilters({ ...filters, documentType: value })}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type de document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="purchases">Achats</SelectItem>
              <SelectItem value="sales">Ventes</SelectItem>
              <SelectItem value="cashReceipts">Bons de caisse</SelectItem>
              <SelectItem value="bankStatements">Relevés bancaires</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en-cours">En cours</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="valide">Validé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Factures
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Taxes
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Mensuel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des factures</CardTitle>
              <CardDescription>Vue d'ensemble de toutes les factures pour la période sélectionnée.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Fournisseur/Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant HT</TableHead>
                    <TableHead className="text-right">Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber || "-"}</TableCell>
                        <TableCell>{invoice.partner || "-"}</TableCell>
                        <TableCell>{invoice.invoiceDate || "-"}</TableCell>
                        <TableCell className="text-right">{invoice.amount} DH</TableCell>
                        <TableCell className="text-right">{invoice.amountWithTax} DH</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === "valide"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : invoice.status === "en-cours"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {invoice.status === "valide"
                              ? "Validé"
                              : invoice.status === "en-cours"
                                ? "En cours"
                                : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              invoice.documentType === "purchases"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : invoice.documentType === "sales"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : invoice.documentType === "cashReceipts"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {invoice.documentType === "purchases"
                              ? "Achat"
                              : invoice.documentType === "sales"
                                ? "Vente"
                                : invoice.documentType === "cashReceipts"
                                  ? "Bon de caisse"
                                  : "Relevé bancaire"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Aucune facture trouvée pour les critères sélectionnés.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des taxes</CardTitle>
              <CardDescription>Vue d'ensemble des taxes pour la période sélectionnée.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Le rapport des taxes sera disponible prochainement.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport mensuel</CardTitle>
              <CardDescription>Vue d'ensemble des transactions par mois.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Le rapport mensuel sera disponible prochainement.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

