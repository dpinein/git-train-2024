import { type NextRequest, NextResponse } from "next/server"
import { db, analyses } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Delete the analysis
    await db.delete(analyses).where(eq(analyses.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get specific analysis
    const analysis = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1)

    if (analysis.length === 0) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({ analysis: analysis[0] })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
