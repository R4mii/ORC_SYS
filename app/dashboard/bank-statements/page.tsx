import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BankStatementUploader from "@/components/bank-statement-uploader"

export default function BankStatementsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Relevés Bancaires</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Charger un relevé</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <BankStatementUploader />
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Aucun relevé bancaire n'a été traité pour le moment.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
