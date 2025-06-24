import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ["DataGenius Analysis Report"],
      [""],
      ["File Name", data.fileName],
      ["Generated", new Date().toLocaleDateString()],
      [""],
      ["Executive Summary"],
      [data.summary],
      [""],
      ["Key Performance Indicators"],
      ["Metric", "Value", "Change"],
      ...data.kpis.map((kpi: any) => [kpi.label, kpi.value, kpi.change || ""]),
      [""],
      ["Key Insights"],
      ...data.insights.map((insight: string, index: number) => [`${index + 1}`, insight]),
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Chart Data Sheet
    const chartHeaders = ["Category", "Value"]
    const chartData = [chartHeaders, ...data.chartData.map((item: any) => [item.name, item.value])]
    const chartSheet = XLSX.utils.aoa_to_sheet(chartData)
    XLSX.utils.book_append_sheet(workbook, chartSheet, "Chart Data")

    // Raw Data Sheet (first 1000 rows to avoid memory issues)
    if (data.rawData && data.rawData.length > 0) {
      const headers = Object.keys(data.rawData[0])
      const rawDataForExport = [
        headers,
        ...data.rawData.slice(0, 1000).map((row: any) => headers.map((header) => row[header] || "")),
      ]
      const rawDataSheet = XLSX.utils.aoa_to_sheet(rawDataForExport)
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, "Raw Data")
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${data.fileName}_analysis.xlsx"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Excel export error:", error)
    return NextResponse.json(
      { error: "Failed to generate Excel file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
