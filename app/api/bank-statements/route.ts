import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET all bank statements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    let query = `
      SELECT * FROM bank_statements 
      WHERE 1=1
    `

    const params: any[] = []

    if (companyId) {
      query += ` AND company_id = $${params.length + 1}`
      params.push(companyId)
    }

    query += ` ORDER BY created_at DESC`

    const bankStatements = await sql(query, params)

    return NextResponse.json(bankStatements)
  } catch (error) {
    console.error("Error fetching bank statements:", error)
    return NextResponse.json({ error: "Failed to fetch bank statements" }, { status: 500 })
  }
}

// POST a new bank statement
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      user_id,
      company_id,
      account_holder_name,
      bank_name,
      account_number,
      statement_date,
      previous_balance,
      new_balance,
      currency,
      status,
      declaration_status,
      ocr_confidence,
      original_filename,
      original_filepath,
      original_mimetype,
      raw_text,
      notes,
    } = data

    const result = await sql`
      INSERT INTO bank_statements (
        user_id,
        company_id,
        account_holder_name,
        bank_name,
        account_number,
        statement_date,
        previous_balance,
        new_balance,
        currency,
        status,
        declaration_status,
        ocr_confidence,
        original_filename,
        original_filepath,
        original_mimetype,
        raw_text,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${user_id || null},
        ${company_id || null},
        ${account_holder_name || ""},
        ${bank_name || ""},
        ${account_number || ""},
        ${statement_date ? new Date(statement_date) : null},
        ${previous_balance || 0},
        ${new_balance || 0},
        ${currency || "MAD"},
        ${status || "draft"},
        ${declaration_status || "undeclared"},
        ${ocr_confidence || 0},
        ${original_filename || ""},
        ${original_filepath || ""},
        ${original_mimetype || ""},
        ${raw_text || ""},
        ${notes || ""},
        NOW(),
        NOW()
      ) RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating bank statement:", error)
    return NextResponse.json({ error: "Failed to create bank statement" }, { status: 500 })
  }
}
