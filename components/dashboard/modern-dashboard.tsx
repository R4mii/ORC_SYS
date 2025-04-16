"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, ScaleIn, Stagger } from "@/components/ui/motion"
import {
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  TrendingUp,
  Calendar,
  Filter,
  Building,
  Landmark,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ModernFileUploadModal } from "@/components/modern-file-upload-modal"
import { useToast } from "@/components/ui/use-toast"

export function ModernDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadDocumentType, setUploadDocumentType] = useState<
    "purchases" | "sales" | "cashReceipts" | "bankStatements"
  >("purchases")

  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingInvoices: 0,
    totalAmount: 0,
    vatAmount: 0,
    recentDocuments: [],
    monthlyData: [
      { month: "Jan", purchases: 12500, sales: 15000 },
      { month: "Fév", purchases: 15000, sales: 18000 },
      { month: "Mar", purchases: 18000, sales: 22000 },
      { month: "Avr", purchases: 16000, sales: 19000 },
      { month: "Mai", purchases: 21000, sales: 25000 },
      { month: "Juin", purchases: 19000, sales: 23000 },
    ],
    vatData: {
      collected: 25000,
      paid: 18000,
      balance: 7000,
    },
  })

  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Load data from localStorage
      const companyId = localStorage.getItem("selectedCompanyId") || "default"

      // Get purchases
      const purchasesJson = localStorage.getItem(`purchases_${companyId}`)
      const purchases = purchasesJson ? JSON.parse(purchasesJson) : []

      // Get sales
      const salesJson = localStorage.getItem(`sales_${companyId}`)
      const sales = salesJson ? JSON.parse(salesJson) : []

      // Combine all documents
      const allDocuments = [...purchases, ...sales]

      // Calculate stats
      const totalInvoices = allDocuments.length
      const pendingInvoices = allDocuments.filter((doc) => doc.paymentStatus === "non-paye").length
      const totalAmount = allDocuments.reduce((sum, doc) => sum + (doc.amountWithTax || 0), 0)
      const vatAmount = allDocuments.reduce((sum, doc) => sum + (doc.vatAmount || 0), 0)

      // Sort documents by date (newest first)
      const recentDocuments = [...allDocuments]
        .sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        .slice(0, 5)

      setStats({
        ...stats,
        totalInvoices,
        pendingInvoices,
        totalAmount,
        vatAmount,
        recentDocuments,
      })

      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case "en-cours":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        )
      case "valide":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Validé
          </Badge>
        )
      case "non-paye":
        return (
          <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Non payé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleUploadClick = (type: "purchases" | "sales" | "cashReceipts" | "bankStatements") => {
    setUploadDocumentType(type)
    setIsUploadModalOpen(true)
  }

  const handleUploadComplete = (data: any) => {
    console.log("Upload complete:", data)
    // Here you would save the data to your database or state

    // For now, we'll just show a toast message
    toast({
      title: "Document traité avec succès",
      description: "Les données ont été extraites et enregistrées",
      variant: "default",
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Aperçu de votre activité financière</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Période</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              <span>Importer</span>
            </Button>
          </div>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ScaleIn>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : stats.totalInvoices}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-green-500 font-medium inline-flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      12%
                    </span>{" "}
                    depuis le mois dernier
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </ScaleIn>

        <ScaleIn>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : stats.pendingInvoices}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-red-500 font-medium inline-flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      5%
                    </span>{" "}
                    depuis le mois dernier
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </ScaleIn>

        <ScaleIn>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  `${stats.totalAmount.toLocaleString()} DH`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-green-500 font-medium inline-flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      18%
                    </span>{" "}
                    depuis le mois dernier
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </ScaleIn>

        <ScaleIn>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">TVA</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  `${stats.vatAmount.toLocaleString()} DH`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <span className="text-red-500 font-medium inline-flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      3%
                    </span>{" "}
                    depuis le mois dernier
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </ScaleIn>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <FadeIn className="lg:col-span-2" delay={0.3}>
          <Card className="h-full border-none shadow-md">
            <CardHeader>
              <CardTitle>Évolution des achats et ventes</CardTitle>
              <CardDescription>Comparaison mensuelle des achats et ventes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded" />
              ) : (
                <div className="h-[300px] flex items-end space-x-2">
                  {stats.monthlyData.map((data, index) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                      <div className="w-full flex items-end justify-center space-x-1 h-[250px]">
                        <div
                          className="w-5 bg-blue-400 rounded-t transition-all duration-500"
                          style={{
                            height: `${(data.purchases / 25000) * 100}%`,
                            animationDelay: `${index * 0.1}s`,
                            animation: "growUp 1s ease-out forwards",
                          }}
                        />
                        <div
                          className="w-5 bg-blue-600 rounded-t transition-all duration-500"
                          style={{
                            height: `${(data.sales / 25000) * 100}%`,
                            animationDelay: `${index * 0.1 + 0.1}s`,
                            animation: "growUp 1s ease-out forwards",
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{data.month}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="h-full border-none shadow-md">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  onClick={() => handleUploadClick("purchases")}
                >
                  <Receipt className="h-6 w-6" />
                  <span>Achats</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                  onClick={() => handleUploadClick("sales")}
                >
                  <FileText className="h-6 w-6" />
                  <span>Ventes</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                  onClick={() => handleUploadClick("bankStatements")}
                >
                  <Landmark className="h-6 w-6" />
                  <span>Rel. bancaires</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors"
                >
                  <Building className="h-6 w-6" />
                  <span>Entreprises</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.5}>
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Documents récents</CardTitle>
            <CardDescription>Les derniers documents ajoutés à votre système</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : stats.recentDocuments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun document récent</p>
                <Button variant="outline" className="mt-4">
                  Ajouter un document
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-3 text-sm font-medium text-muted-foreground bg-muted/50">
                  <div>Document</div>
                  <div>Numéro</div>
                  <div>Date</div>
                  <div className="text-right">Montant</div>
                  <div className="text-center">Statut</div>
                </div>
                {stats.recentDocuments.map((doc, i) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "grid grid-cols-5 p-3 text-sm items-center hover:bg-muted/30 transition-colors",
                      i !== stats.recentDocuments.length - 1 && "border-b",
                    )}
                  >
                    <div className="font-medium truncate">{doc.name}</div>
                    <div className="text-muted-foreground truncate">{doc.invoiceNumber}</div>
                    <div className="text-muted-foreground">{doc.invoiceDate}</div>
                    <div className="text-right font-medium">{doc.amountWithTax.toLocaleString()} DH</div>
                    <div className="text-center">{getStatusBadge(doc.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <ModernFileUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        documentType={uploadDocumentType}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
