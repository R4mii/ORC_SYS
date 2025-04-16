import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the bank statement by ID
    const result = await sql(`SELECT * FROM bank_statements WHERE id = $1`, [id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching bank statement:", error)
    return NextResponse.json({ error: "Failed to fetch bank statement" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Prepare the update query
    const fields = Object.keys(data).filter((key) => key !== "id" && data[key] !== undefined && data[key] !== null)

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(", ")
    const values = fields.map((field) => data[field])

    // Add updated_at timestamp
    const query = `
      UPDATE bank_statements
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `

    const result = await sql(query, [id, ...values])

    if (result.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating bank statement:", error)
    return NextResponse.json({ error: "Failed to update bank statement" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Delete the bank statement
    const result = await sql(`DELETE FROM bank_statements WHERE id = $1 RETURNING id`, [id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Bank statement not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Error deleting bank statement:", error)
    return NextResponse.json({ error: "Failed to delete bank statement" }, { status: 500 })
  }
}
