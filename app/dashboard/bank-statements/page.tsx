"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BankStatementUploader from "@/components/bank-statement-uploader"

export default function BankStatementsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relevés Bancaires</h2>
      </div>
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Charger un relevé</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <BankStatementUploader />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Aucun relevé bancaire n'a été traité pour le moment.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
