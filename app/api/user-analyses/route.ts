import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ analyses: [] })
    }

    const sql = neon(process.env.DATABASE_URL)
    const analyses = await sql`
      SELECT id, user_id, file_name, file_type, row_count, column_count, created_at, updated_at
      FROM analyses 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Failed to fetch analyses:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}
