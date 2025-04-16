"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Upload, BarChart3, FileUp, CreditCard, Clock, Users, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { ModernFileUploadModal } from "@/components/modern-file-upload-modal"

export function ModernDashboard() {
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"invoice" | "bankStatement">("invoice")

  const handleUploadClick = (type: "invoice" | "bankStatement") => {
    if (type === "bankStatement") {
      router.push("/dashboard/bank-statements")
    } else {
      setUploadType(type)
      setIsUploadModalOpen(true)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center space-x-2">
          <Button>Télécharger</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures totales</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">+5.1% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">-2.5% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant total</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,231.89 €</div>
                <p className="text-xs text-muted-foreground">+10.1% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">+12.4% par rapport au mois dernier</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-md">
                  <BarChart3 className="h-16 w-16 text-slate-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Effectuez des actions rapides pour gérer vos documents.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUploadClick("invoice")}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Factures
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleUploadClick("bankStatement")}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Rel. bancaires
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Rapports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Analytique</CardTitle>
                <CardDescription>Visualisez les tendances et les performances de vos factures.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-md">
                  <BarChart3 className="h-16 w-16 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7">
              <CardHeader>
                <CardTitle>Rapports</CardTitle>
                <CardDescription>Générez et consultez des rapports détaillés sur vos activités.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rapport mensuel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">Dernière génération: 01/04/2023</div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" className="w-full">
                          Télécharger
                        </Button>
                      </CardFooter>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Rapport trimestriel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">Dernière génération: 31/03/2023</div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" className="w-full">
                          Télécharger
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Consultez vos dernières notifications et alertes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-4 rounded-md border p-4">
                  <div>
                    <p className="text-sm font-medium">Nouvelle facture ajoutée</p>
                    <p className="text-sm text-muted-foreground">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rounded-md border p-4">
                  <div>
                    <p className="text-sm font-medium">Rapport mensuel disponible</p>
                    <p className="text-sm text-muted-foreground">Il y a 1 jour</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rounded-md border p-4">
                  <div>
                    <p className="text-sm font-medium">Mise à jour du système</p>
                    <p className="text-sm text-muted-foreground">Il y a 3 jours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModernFileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} type={uploadType} />
    </div>
  )
}
