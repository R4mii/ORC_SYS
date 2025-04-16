"use client"

import { BankStatementUpload } from "@/components/bank-statement-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BankStatementsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relevés Bancaires</h2>
      </div>
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Télécharger</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <BankStatementUpload />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des relevés bancaires</CardTitle>
              <CardDescription>Consultez l'historique de vos relevés bancaires traités</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Aucun relevé bancaire n'a été traité pour le moment.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
