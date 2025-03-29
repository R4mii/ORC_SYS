import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <Tabs defaultValue="apercu" className="w-full">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="factures">Factures</TabsTrigger>
          <TabsTrigger value="comptabilite">Comptabilité</TabsTrigger>
        </TabsList>

        <TabsContent value="apercu" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 depuis le mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures traitées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">54</div>
                <p className="text-xs text-muted-foreground">+19 depuis le mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total TVA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 540,00 DH</div>
                <p className="text-xs text-muted-foreground">+2 420,00 DH depuis le mois dernier</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total HT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">64 500,00 DH</div>
                <p className="text-xs text-muted-foreground">+14 200,00 DH depuis le mois dernier</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Les dernières factures ajoutées au système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-sm">FA{i}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">HITECH LAND - FA2{i} 20210460</div>
                        <div className="text-sm text-muted-foreground">
                          Ajouté il y a {i} jour{i > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{i * 1000 + 726},00 DH</div>
                        <div className="text-sm text-muted-foreground">TVA 20%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Répartition par types</CardTitle>
                <CardDescription>Répartition des factures par type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Achats de marchandises</div>
                    <div className="font-medium">65%</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[65%]"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">Prestations de services</div>
                    <div className="font-medium">25%</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[25%]"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">Autres</div>
                    <div className="font-medium">10%</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[10%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="factures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Factures récentes</CardTitle>
              <CardDescription>Consultez les dernières factures ajoutées au système</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Le contenu détaillé des factures sera affiché ici.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comptabilite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Écritures comptables</CardTitle>
              <CardDescription>Consultez les écritures comptables générées</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Le contenu détaillé des écritures comptables sera affiché ici.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

