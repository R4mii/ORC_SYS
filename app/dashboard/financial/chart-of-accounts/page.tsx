import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ChartOfAccountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Categories</CardTitle>
          <CardDescription>Manage account categories</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Implement the Chart of Accounts view here */}
          <p>Chart of Accounts View will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}
