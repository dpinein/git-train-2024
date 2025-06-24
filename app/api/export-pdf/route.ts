import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function POST(request: NextRequest) {
  let browser = null

  try {
    const data = await request.json()

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DataGenius Analysis Report</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6; 
            color: #333;
            font-size: 12px;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .title { 
            color: #3b82f6; 
            font-size: 24px; 
            font-weight: bold;
            margin-bottom: 8px;
        }
        .subtitle { 
            color: #666; 
            font-size: 14px;
        }
        .section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title { 
            color: #3b82f6; 
            font-size: 16px; 
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 12px;
        }
        .summary-text {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 15px;
        }
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px; 
            margin-bottom: 15px;
        }
        .kpi-card { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            border-radius: 6px; 
            background: #f9fafb;
        }
        .kpi-label { 
            font-size: 11px; 
            color: #666; 
            margin-bottom: 4px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .kpi-value { 
            font-size: 18px; 
            font-weight: bold; 
            color: #1f2937;
        }
        .kpi-change { 
            font-size: 10px; 
            margin-top: 4px;
            color: #059669;
        }
        .insight-list { 
            list-style: none; 
            padding: 0;
            margin: 0;
        }
        .insight-item { 
            background: #f0f9ff; 
            border-left: 4px solid #3b82f6; 
            padding: 12px; 
            margin-bottom: 8px; 
            border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
        }
        .chart-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
            font-size: 11px;
        }
        .chart-table th, .chart-table td { 
            border: 1px solid #e5e7eb; 
            padding: 8px; 
            text-align: left;
        }
        .chart-table th { 
            background: #f9fafb; 
            font-weight: bold;
            color: #374151;
        }
        .chart-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 10px; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 15px;
        }
        .page-break {
            page-break-before: always;
        }
        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">📊 DataGenius Analysis Report</div>
        <div class="subtitle">File: ${data.fileName} | Generated: ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="section">
        <div class="section-title">🤖 Executive Summary</div>
        <div class="summary-text">${data.summary}</div>
    </div>

    <div class="section">
        <div class="section-title">📈 Key Performance Indicators</div>
        <div class="kpi-grid">
            ${data.kpis
              .map(
                (kpi: any) => `
                <div class="kpi-card">
                    <div class="kpi-label">${kpi.label}</div>
                    <div class="kpi-value">${kpi.value}</div>
                    ${kpi.change ? `<div class="kpi-change">${kpi.change}</div>` : ""}
                </div>
            `,
              )
              .join("")}
        </div>
    </div>

    <div class="section">
        <div class="section-title">🔍 Key Insights</div>
        <ul class="insight-list">
            ${data.insights
              .map(
                (insight: string, index: number) => `
                <li class="insight-item">
                    <strong>${index + 1}.</strong> ${insight}
                </li>
            `,
              )
              .join("")}
        </ul>
    </div>

    <div class="section page-break">
        <div class="section-title">📊 Chart Data Summary</div>
        <table class="chart-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Value</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${data.chartData
                  .slice(0, 25)
                  .map((item: any, index: number) => {
                    const total = data.chartData.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
                    return `
                    <tr>
                        <td>${item.name}</td>
                        <td>${typeof item.value === "number" ? item.value.toLocaleString() : item.value}</td>
                        <td>${percentage}%</td>
                    </tr>
                `
                  })
                  .join("")}
            </tbody>
        </table>
        ${data.chartData.length > 25 ? `<p style="margin-top: 10px; font-style: italic; color: #666;">Showing top 25 of ${data.chartData.length} entries</p>` : ""}
    </div>

    <div class="footer">
        <p><strong>Generated by DataGenius AI</strong> | ${new Date().toLocaleString()}</p>
        <p>This report contains AI-generated insights based on your uploaded data.</p>
        <p>For questions or support, visit our website or contact our team.</p>
    </div>
</body>
</html>`

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    })

    const page = await browser.newPage()

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1in",
        right: "1in",
        bottom: "1in",
        left: "1in",
      },
    })

    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.fileName}_analysis_report.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)

    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
