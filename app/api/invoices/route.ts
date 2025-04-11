import { NextResponse } from "next/server"
import type { Invoice } from "@/lib/db-schema"

// Mock data for demonstration
const invoices: Invoice[] = [
  {
    id: "1",
    userId: "1",
    invoiceNumber: "INV-001",
    date: new Date("2023-06-15"),
    supplier: "Office Supplies Co.",
    amount: 1250.0,
    vat: 250.0,
    status: "paid",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "1",
    invoiceNumber: "INV-002",
    date: new Date("2023-06-20"),
    supplier: "Tech Solutions Inc.",
    amount: 3450.75,
    vat: 690.15,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more mock invoices as needed
]

export async function GET() {
  // In a real app, you would fetch invoices from the database
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // In a real app, you would validate the data and save to the database
    const newInvoice: Invoice = {
      id: String(invoices.length + 1),
      userId: data.userId,
      invoiceNumber: data.invoiceNumber,
      date: new Date(data.date),
      supplier: data.supplier,
      amount: data.amount,
      vat: data.vat,
      status: data.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    invoices.push(newInvoice)

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
