"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DashboardCard } from "@/components/dashboard-card"
import {
  BarChart3,
  FileText,
  CreditCard,
  Building2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import { CalendarIcon } from "lucide-react"
import { FileUploadModal } from "@/components/file-upload-modal"

// Define document types for categorization
type DocumentType = "purchases" | "sales" | "cashReceipts" | "bankStatements"

export default function DashboardPage() {
  const router = useRouter()
  const [fiscalYear, setFiscalYear] = useState("01-01-2024 / 31-12-2024")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [currentUploadType, setCurrentUploadType] = useState<DocumentType>("purchases")
  const [currentCompany, setCurrentCompany] = useState<{ name: string; id: string } | null>(null)
  const [stats, setStats] = useState({
    purchases: {
      inProgress: 0,
      toValidate: 0,
      toExport: 0,
    },
    sales: {
      inProgress: 0,
      toValidate: 0,
      toExport: 0,
    },
    cashReceipts: {
      inProgress: 0,
      toValidate: 0,
      toExport: 0,
    },
    bankStatements: {
      inProgress: 0,
      toValidate: 0,
    },
    totalAmount: 0,
    vatAmount: 0,
  })

  useEffect(() => {
    // Only run this code in the browser
    if (typeof window === "undefined") return

    // Get the selected company from localStorage
    const companyId = localStorage.getItem("selectedCompanyId")
    if (!companyId) {
      router.push("/auth/login")
      return
    }

    // Get company details
    const companies = JSON.parse(localStorage.getItem("companies") || "[]")
    const company = companies.find((c: any) => c.id === companyId)
    if (company) {
      setCurrentCompany({
        id: company.id,
        name: company.name,
      })
    } else {
      router.push("/auth/login")
      return
    }

    // Calculate stats for each document type
    calculateStats(companyId)
  }, [router])

  // Update the calculateStats function to properly calculate the total amount from sales
  const calculateStats = (companyId: string) => {
    // Initialize stats
    const newStats = {
      purchases: { inProgress: 0, toValidate: 0, toExport: 0 },
      sales: { inProgress: 0, toValidate: 0, toExport: 0 },
      cashReceipts: { inProgress: 0, toValidate: 0, toExport: 0 },
      bankStatements: { inProgress: 0, toValidate: 0, toExport: 0 },
      totalAmount: 0,
      vatAmount: 0,
    }

    // Get documents for each type
    const documentTypes: DocumentType[] = ["purchases", "sales", "cashReceipts", "bankStatements"]

    documentTypes.forEach((type) => {
      const documentsJson = localStorage.getItem(`${type}_${companyId}`)
      if (documentsJson) {
        const documents = JSON.parse(documentsJson)

        // Count documents by status
        newStats[type].inProgress = documents.filter((doc: any) => doc.status === "en-cours").length
        newStats[type].toValidate = documents.filter((doc: any) => doc.status === "brouillon").length
        newStats[type].toExport = documents.filter(
          (doc: any) => doc.status === "valide" && doc.declarationStatus === "non-declare",
        ).length

        // Calculate total amount (only for sales)
        if (type === "sales") {
          newStats.totalAmount = documents.reduce((sum: number, doc: any) => {
            // Parse the amount, handling both number and string formats
            const amount =
              typeof doc.amountWithTax === "number"
                ? doc.amountWithTax
                : Number.parseFloat(doc.amountWithTax.replace(",", ".")) || 0
            return sum + amount
          }, 0)
        }
      } else {
        // Initialize empty array if none exists
        localStorage.setItem(`${type}_${companyId}`, JSON.stringify([]))
      }
    })

    // Set the calculated stats
    setStats(newStats)
  }

  const handleUploadClick = (type: DocumentType) => {
    setCurrentUploadType(type)
    setUploadModalOpen(true)
  }

  const handleUploadComplete = (result: any) => {
    if (!currentCompany) return

    // Create a new document from OCR results
    const newDocument = {
      id: Math.random().toString(36).substring(2, 9),
      name: result.invoice.supplier
        ? `Facture ${result.invoice.supplier}`
        : `Document ${new Date().toLocaleDateString()}`,
      description: result.originalFile.name,
      invoiceNumber:
        result.invoice.invoiceNumber ||
        `INV-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
      partner: result.invoice.supplier || "Fournisseur inconnu",
      invoiceDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
      dueDate: result.invoice.invoiceDate || new Date().toLocaleDateString(),
      createdAt: new Date().toLocaleDateString(),
      amount: result.invoice.amount || 0,
      amountWithTax: result.invoice.amountWithTax || 0,
      vatAmount: result.invoice.vatAmount || 0,
      type: "facture",
      paymentStatus: "non-paye",
      declarationStatus: "non-declare",
      status: "en-cours",
      hasWarning: result.invoice.confidence < 0.7,
      documentType: currentUploadType,
      ocrConfidence: result.invoice.confidence,
      rawText: result.rawText,
    }

    // Get existing documents for this type
    const storageKey = `${currentUploadType}_${currentCompany.id}`
    const existingDocumentsJson = localStorage.getItem(storageKey)
    const existingDocuments = existingDocumentsJson ? JSON.parse(existingDocumentsJson) : []

    // Save to localStorage for this company and document type
    localStorage.setItem(storageKey, JSON.stringify([newDocument, ...existingDocuments]))

    // Update stats
    calculateStats(currentCompany.id)

    // Close the modal
    setUploadModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          {currentCompany && (
            <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50 mr-2">
              <Building2 className="h-4 w-4 mr-2" />
              {currentCompany.name}
            </Badge>
          )}
          <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Exercice : {fiscalYear}
          </Badge>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total des factures</p>
                <h3 className="text-2xl font-bold">
                  {stats.purchases.inProgress +
                    stats.purchases.toValidate +
                    stats.purchases.toExport +
                    stats.sales.inProgress +
                    stats.sales.toValidate +
                    stats.sales.toExport}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </span>
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Montant total</p>
                <h3 className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} DH</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% ce mois
                  </span>
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">TVA récupérable</p>
                <h3 className="text-2xl font-bold">0,00 DH</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-amber-600 font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +0.0% ce mois
                  </span>
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-800/30 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">À déclarer</p>
                <h3 className="text-2xl font-bold">{stats.purchases.toExport + stats.sales.toExport}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-red-600 font-medium flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2.1% ce mois
                  </span>
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-full">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main document categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Purchases */}
        <DashboardCard
          title="Achats"
          icon={FileText}
          color="blue"
          actionLabel="Charger"
          onAction={() => handleUploadClick("purchases")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{stats.purchases.inProgress} Facture en cours</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.purchases.toValidate} Factures à valider</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.purchases.toExport} Facture à exporter</span>
            </div>
          </div>
        </DashboardCard>

        {/* Sales */}
        <DashboardCard
          title="Ventes"
          icon={BarChart3}
          color="green"
          actionLabel="Charger"
          onAction={() => handleUploadClick("sales")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{stats.sales.inProgress} Facture en cours</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.sales.toValidate} Facture à valider</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.sales.toExport} Facture à exporter</span>
            </div>
          </div>
        </DashboardCard>

        {/* Cash Receipts */}
        <DashboardCard
          title="Bons de caisse"
          icon={CreditCard}
          color="amber"
          actionLabel="Charger"
          onAction={() => handleUploadClick("cashReceipts")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{stats.cashReceipts.inProgress} Bon en cours</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.cashReceipts.toValidate} Bon à valider</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.cashReceipts.toExport} Bon à exporter</span>
            </div>
          </div>
        </DashboardCard>

        {/* Bank Statements */}
        <DashboardCard
          title="Rel. bancaires"
          icon={Building2}
          color="red"
          actionLabel="Charger"
          onAction={() => handleUploadClick("bankStatements")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{stats.bankStatements.inProgress} Relevée en cours</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.bankStatements.inProgress} Relevée en cours</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.bankStatements.toValidate} Relevée à valider</span>
            </div>
            <div className="flex justify-between">
              <span>{stats.bankStatements.toExport} Relevée à exporter</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Bank account charts - replaced with simple cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["ATW (Démo)", "BCP (Démo)", "Citibank (Démo)", "ULNIA BANK (Démo)", "CFG (Démo)", "Espèces (Démo)"].map(
          (account, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-medium">{account}</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    +2.4%
                  </Badge>
                </div>
                <div className="h-[180px] bg-muted/20 flex items-center justify-center rounded-md overflow-hidden">
                  <p className="text-muted-foreground">Chart placeholder: {account}</p>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        documentType={currentUploadType}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
