import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // In a real implementation, you would use a library like xlsx or exceljs
    // to create an actual Excel file with charts and formatting

    // For now, we'll create a simple CSV-like response
    const csvContent = [
      ["Summary", data.summary],
      [""],
      ["Key Insights"],
      ...data.insights.map((insight: string, index: number) => [`${index + 1}`, insight]),
      [""],
      ["KPIs"],
      ...data.kpis.map((kpi: any) => [kpi.label, kpi.value, kpi.change || ""]),
      [""],
      ["Raw Data"],
      ...data.rawData.slice(0, 100).map((row: any) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${data.fileName}_dashboard.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export file" }, { status: 500 })
  }
}
