import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get("companyId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build the query with optional filtering
    let query = `
      SELECT * FROM bank_statements
      WHERE 1=1
    `
    const queryParams: any[] = []

    // Add company filter if provided
    if (companyId) {
      query += ` AND company_id = $${queryParams.length + 1}`
      queryParams.push(companyId)
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    // Execute the query
    const result = await sql(query, queryParams)

    // Get total count for pagination
    const countResult = await sql(
      `SELECT COUNT(*) FROM bank_statements ${companyId ? "WHERE company_id = $1" : ""}`,
      companyId ? [companyId] : [],
    )

    return NextResponse.json({
      data: result,
      total: Number.parseInt(countResult[0].count),
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching bank statements:", error)
    return NextResponse.json({ error: "Failed to fetch bank statements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ["account_holder_name", "bank_name", "statement_date"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Prepare the query
    const fields = Object.keys(data).filter((key) => key !== "id" && data[key] !== undefined && data[key] !== null)

    const placeholders = fields.map((_, i) => `$${i + 1}`)
    const values = fields.map((field) => data[field])

    // Insert the bank statement
    const query = `
      INSERT INTO bank_statements (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `

    const result = await sql(query, values)

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating bank statement:", error)
    return NextResponse.json({ error: "Failed to create bank statement" }, { status: 500 })
  }
}
