import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function GeneralLedgerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">General Ledger</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Balances and Transaction History</CardTitle>
          <CardDescription>View all account balances and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Implement the General Ledger view here */}
          <p>General Ledger View will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  )
}
