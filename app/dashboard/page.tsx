"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  FileText,
  CreditCard,
  Building2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Upload,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { CalendarIcon } from "lucide-react"
import { FileUploadModal } from "@/components/file-upload-modal"
import { BankStatementUploadModal } from "@/components/bank-statement-upload-modal"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Define document types for categorization
type DocumentType = "purchases" | "sales" | "cashReceipts" | "bankStatements"

export default function DashboardPage() {
  const router = useRouter()
  const [fiscalYear, setFiscalYear] = useState("01-01-2024 / 31-12-2024")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [bankStatementModalOpen, setBankStatementModalOpen] = useState(false)
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
      toExport: 0,
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
    if (type === "bankStatements") {
      setBankStatementModalOpen(true)
      setUploadModalOpen(false)
    } else {
      setUploadModalOpen(true)
      setBankStatementModalOpen(false)
    }
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

  const handleBankStatementUploadComplete = (result: any) => {
    if (!currentCompany) return

    // Create a new document from OCR results
    const newDocument = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Rel. bancaire ${new Date().toLocaleDateString()}`,
      description: result.originalFile.name,
      accountHolderName: result.bankStatement.accountHolder || "Titulaire inconnu",
      bankName: result.bankStatement.bank || "Banque inconnue",
      accountNumber: result.bankStatement.accountNumber || "Numéro inconnu",
      statementDate: result.bankStatement.statementDate || new Date().toLocaleDateString(),
      previousBalance: result.bankStatement.previousBalance || 0,
      newBalance: result.bankStatement.newBalance || 0,
      currency: result.bankStatement.currency || "MAD",
      paymentStatus: "non-paye",
      declarationStatus: "non-declare",
      status: "en-cours",
      hasWarning: result.bankStatement.confidence < 0.7,
      documentType: currentUploadType,
      ocrConfidence: result.bankStatement.confidence,
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
    setBankStatementModalOpen(false)
  }

  // Calculate total documents
  const totalDocuments =
    stats.purchases.inProgress +
    stats.purchases.toValidate +
    stats.purchases.toExport +
    stats.sales.inProgress +
    stats.sales.toValidate +
    stats.sales.toExport +
    stats.cashReceipts.inProgress +
    stats.cashReceipts.toValidate +
    stats.cashReceipts.toExport +
    stats.bankStatements.inProgress +
    stats.bankStatements.toValidate +
    stats.bankStatements.toExport

  // Calculate documents to process
  const documentsToProcess =
    stats.purchases.toValidate +
    stats.sales.toValidate +
    stats.cashReceipts.toValidate +
    stats.bankStatements.toValidate

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité financière</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentCompany && (
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 border-primary/20">
              <Building2 className="h-4 w-4 mr-2 text-primary" />
              {currentCompany.name}
            </Badge>
          )}
          <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 border-primary/20">
            <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
            Exercice : {fiscalYear}
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>Période</span>
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </Button>
        <Button size="sm" className="gap-2 ml-auto">
          <Upload className="h-4 w-4" />
          <span>Importer</span>
        </Button>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Nouveau</span>
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-stat-card overflow-hidden border-t-4 border-t-primary/70">
          <div className="icon-container bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total des factures</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">{totalDocuments}</h3>
              <p className="text-xs text-green-600 font-medium flex items-center pb-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12%
              </p>
            </div>
            <Progress value={75} className="h-1 bg-primary/20" />
            <p className="text-xs text-muted-foreground">75% de l'objectif mensuel</p>
          </div>
        </Card>

        <Card className="dashboard-stat-card overflow-hidden border-t-4 border-t-green-500/70">
          <div className="icon-container bg-green-500/10">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Montant total</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} DH</h3>
              <p className="text-xs text-green-600 font-medium flex items-center pb-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </p>
            </div>
            <Progress value={62} className="h-1 bg-green-500/20" indicatorClassName="bg-green-500" />
            <p className="text-xs text-muted-foreground">62% de l'objectif mensuel</p>
          </div>
        </Card>

        <Card className="dashboard-stat-card overflow-hidden border-t-4 border-t-amber-500/70">
          <div className="icon-container bg-amber-500/10">
            <CreditCard className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">TVA récupérable</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">0,00 DH</h3>
              <p className="text-xs text-amber-600 font-medium flex items-center pb-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.0%
              </p>
            </div>
            <Progress value={30} className="h-1 bg-amber-500/20" indicatorClassName="bg-amber-500" />
            <p className="text-xs text-muted-foreground">30% de l'objectif mensuel</p>
          </div>
        </Card>

        <Card className="dashboard-stat-card overflow-hidden border-t-4 border-t-red-500/70">
          <div className="icon-container bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">À traiter</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">{documentsToProcess}</h3>
              <p className="text-xs text-red-600 font-medium flex items-center pb-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1%
              </p>
            </div>
            <Progress value={45} className="h-1 bg-red-500/20" indicatorClassName="bg-red-500" />
            <p className="text-xs text-muted-foreground">
              {documentsToProcess} document{documentsToProcess !== 1 ? "s" : ""} en attente
            </p>
          </div>
        </Card>
      </div>

      {/* Main document categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Purchases */}
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Achats
              </h3>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => handleUploadClick("purchases")}
              >
                Charger
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Factures en cours
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.purchases.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Factures à valider
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {stats.purchases.toValidate}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Factures à exporter
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {stats.purchases.toExport}
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Ventes
              </h3>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => handleUploadClick("sales")}
              >
                Charger
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Factures en cours
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.sales.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Factures à valider
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {stats.sales.toValidate}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Factures à exporter
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {stats.sales.toExport}
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <Button variant="ghost" size="sm" className="text-green-600 gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cash Receipts */}
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Bons de caisse
              </h3>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => handleUploadClick("cashReceipts")}
              >
                Charger
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Bons en cours
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.cashReceipts.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Bons à valider
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {stats.cashReceipts.toValidate}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Bons à exporter
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {stats.cashReceipts.toExport}
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <Button variant="ghost" size="sm" className="text-amber-600 gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bank Statements */}
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Rel. bancaires
              </h3>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => handleUploadClick("bankStatements")}
              >
                Charger
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Relevés en cours
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {stats.bankStatements.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Relevés à valider
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {stats.bankStatements.toValidate}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Relevés à exporter
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {stats.bankStatements.toExport}
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <Button variant="ghost" size="sm" className="text-purple-600 gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank account charts - replaced with simple cards */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comptes bancaires</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un compte
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "ATW (Démo)", balance: "45,230.00", currency: "DH", change: "+2.4%", color: "blue" },
            { name: "BCP (Démo)", balance: "32,150.75", currency: "DH", change: "+1.8%", color: "green" },
            { name: "Citibank (Démo)", balance: "12,430.50", currency: "DH", change: "-0.5%", color: "red" },
            { name: "ULNIA BANK (Démo)", balance: "8,750.25", currency: "DH", change: "+3.2%", color: "blue" },
            { name: "CFG (Démo)", balance: "5,320.00", currency: "DH", change: "+0.7%", color: "green" },
            { name: "Espèces (Démo)", balance: "2,150.00", currency: "DH", change: "+0.0%", color: "amber" },
          ].map((account, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-all duration-200">
              <CardContent className="p-0">
                <div className={`p-4 border-b bg-${account.color}-50`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{account.name}</h3>
                    <Badge
                      variant="outline"
                      className={`${
                        account.change.startsWith("+")
                          ? "bg-green-50 text-green-700"
                          : account.change.startsWith("-")
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {account.change}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">Solde actuel</span>
                    <span className="text-lg font-semibold">
                      {account.balance} {account.currency}
                    </span>
                  </div>
                  <div className="h-[80px] bg-muted/20 rounded-md overflow-hidden flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Graphique d'évolution</span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                      Détails <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        documentType={
          currentUploadType === "purchases" || currentUploadType === "sales" ? currentUploadType : "purchases"
        }
        onUploadComplete={handleUploadComplete}
      />
      <BankStatementUploadModal
        open={bankStatementModalOpen}
        onClose={() => setBankStatementModalOpen(false)}
        onUploadComplete={handleBankStatementUploadComplete}
      />
    </div>
  )
}
