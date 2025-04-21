import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

// Schema for ticket creation
const ticketSchema = z.object({
  subject: z.string().min(3).max(255),
  message: z.string().min(10),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
})

// GET handler to fetch user's tickets
export async function GET(req: NextRequest) {
  try {
    // In a real app, get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = 1 // Replace with actual user authentication

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    let query = `
      SELECT id, subject, priority, status, created_at, updated_at
      FROM support_tickets
      WHERE user_id = $1
    `
    const params = [userId]

    // Add status filter if provided
    if (status) {
      query += ` AND status = $2`
      params.push(status)
    }

    query += ` ORDER BY updated_at DESC`

    const tickets = await sql(query, params)

    return NextResponse.json({ tickets }, { status: 200 })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
  }
}

// POST handler to create a new ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body
    const validatedData = ticketSchema.parse(body)

    // In a real app, get the user ID from the session
    const userId = 1 // Replace with actual user authentication

    // Insert the ticket into the database
    const result = await sql(
      `
      INSERT INTO support_tickets (user_id, subject, message, priority, status)
      VALUES ($1, $2, $3, $4, 'open')
      RETURNING id, subject, priority, status, created_at
    `,
      [userId, validatedData.subject, validatedData.message, validatedData.priority],
    )

    // Also insert the initial message
    if (result && result.length > 0) {
      const ticketId = result[0].id
      await sql(
        `
        INSERT INTO support_messages (ticket_id, user_id, message, is_staff)
        VALUES ($1, $2, $3, false)
      `,
        [ticketId, userId, validatedData.message],
      )
    }

    return NextResponse.json({ ticket: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
  }
}
