import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET a specific bank statement
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const bankStatement = await sql`
      SELECT * FROM bank_statements WHERE id = ${id}
    `

    if (!bankStatement || bankStatement.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json(bankStatement[0])
  } catch (error) {
    console.error("Error fetching bank statement:", error)
    return NextResponse.json({ error: "Failed to fetch bank statement" }, { status: 500 })
  }
}

// UPDATE a bank statement
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    const {
      account_holder_name,
      bank_name,
      account_number,
      statement_date,
      previous_balance,
      new_balance,
      currency,
      status,
      declaration_status,
      notes,
    } = data

    const result = await sql`
      UPDATE bank_statements
      SET
        account_holder_name = ${account_holder_name || null},
        bank_name = ${bank_name || null},
        account_number = ${account_number || null},
        statement_date = ${statement_date ? new Date(statement_date) : null},
        previous_balance = ${previous_balance || 0},
        new_balance = ${new_balance || 0},
        currency = ${currency || "MAD"},
        status = ${status || "draft"},
        declaration_status = ${declaration_status || "undeclared"},
        notes = ${notes || ""},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating bank statement:", error)
    return NextResponse.json({ error: "Failed to update bank statement" }, { status: 500 })
  }
}

// DELETE a bank statement
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM bank_statements
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bank statement deleted successfully" })
  } catch (error) {
    console.error("Error deleting bank statement:", error)
    return NextResponse.json({ error: "Failed to delete bank statement" }, { status: 500 })
  }
}
