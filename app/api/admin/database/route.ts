import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ analyses: [], count: 0 })
    }

    const sql = neon(process.env.DATABASE_URL)
    const analyses = await sql`
      SELECT id, user_id, file_name, file_type, row_count, column_count, created_at, updated_at
      FROM analyses 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      analyses,
      count: analyses.length,
    })
  } catch (error) {
    console.error("Database query error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
