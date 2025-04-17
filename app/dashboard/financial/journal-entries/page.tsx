import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JournalEntriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
        <Button>Add New Entry</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Record Journal Entries</CardTitle>
          <CardDescription>Use the form below to record debits and credits</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Implement the form here */}
          <p>Journal Entry Form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}
