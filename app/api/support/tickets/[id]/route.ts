import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

// GET handler to fetch a specific ticket with messages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 })
    }

    // In a real app, get the user ID from the session and verify ownership
    const userId = 1 // Replace with actual user authentication

    // Get the ticket
    const ticketResult = await sql(
      `
      SELECT id, subject, message, priority, status, created_at, updated_at
      FROM support_tickets
      WHERE id = $1 AND user_id = $2
    `,
      [ticketId, userId],
    )

    if (!ticketResult || ticketResult.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Get the messages for this ticket
    const messagesResult = await sql(
      `
      SELECT id, message, is_staff, created_at
      FROM support_messages
      WHERE ticket_id = $1
      ORDER BY created_at ASC
    `,
      [ticketId],
    )

    return NextResponse.json(
      {
        ticket: ticketResult[0],
        messages: messagesResult,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch support ticket" }, { status: 500 })
  }
}

// PUT handler to update a ticket (e.g., change status)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 })
    }

    const body = await req.json()

    // In a real app, get the user ID from the session and verify ownership
    const userId = 1 // Replace with actual user authentication

    // Validate that the ticket exists and belongs to the user
    const ticketCheck = await sql(
      `
      SELECT id FROM support_tickets
      WHERE id = $1 AND user_id = $2
    `,
      [ticketId, userId],
    )

    if (!ticketCheck || ticketCheck.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update the ticket
    const allowedUpdates = ["status"] // Only allow updating status for now
    const updates: Record<string, any> = {}

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    // Build the update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(", ")

    const updateValues = [ticketId, userId, ...Object.values(updates)]

    const result = await sql(
      `
      UPDATE support_tickets
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id, subject, priority, status, updated_at
    `,
      updateValues,
    )

    return NextResponse.json({ ticket: result[0] }, { status: 200 })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Failed to update support ticket" }, { status: 500 })
  }
}
