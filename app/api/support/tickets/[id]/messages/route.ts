import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

// Schema for message creation
const messageSchema = z.object({
  message: z.string().min(1),
})

// POST handler to add a message to a ticket
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 })
    }

    const body = await req.json()

    // Validate request body
    const validatedData = messageSchema.parse(body)

    // In a real app, get the user ID from the session
    const userId = 1 // Replace with actual user authentication

    // Verify the ticket exists and belongs to the user
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

    // Insert the message
    const result = await sql(
      `
      INSERT INTO support_messages (ticket_id, user_id, message, is_staff)
      VALUES ($1, $2, $3, false)
      RETURNING id, message, is_staff, created_at
    `,
      [ticketId, userId, validatedData.message],
    )

    // Update the ticket's updated_at timestamp
    await sql(
      `
      UPDATE support_tickets
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [ticketId],
    )

    return NextResponse.json({ message: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error adding message:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}
