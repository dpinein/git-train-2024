import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create comprehensive HTML content for PDF
    const htmlContent = generatePDFHTML(data)

    // Try different PDF generation approaches based on environment
    if (process.env.VERCEL) {
      // Use HTML-to-PDF service for Vercel deployment
      return await generatePDFWithService(htmlContent, data.fileName)
    } else {
      // Use Puppeteer for local development
      return await generatePDFWithPuppeteer(htmlContent, data.fileName)
    }
  } catch (error) {
    console.error("PDF generation error:", error)

    // Fallback: Return HTML file if PDF generation fails
    return generateHTMLFallback(await request.json())
  }
}

async function generatePDFWithService(htmlContent: string, fileName: string) {
  try {
    // Use a PDF generation service API (like HTMLCSStoImage or similar)
    const response = await fetch("https://hcti.io/v1/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HTMLCSS_API_KEY || "demo"}`,
      },
      body: JSON.stringify({
        html: htmlContent,
        css: "",
        format: "pdf",
        width: 800,
        height: 1200,
      }),
    })

    if (response.ok) {
      const pdfBuffer = await response.arrayBuffer()
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}_report.pdf"`,
        },
      })
    }

    throw new Error("PDF service failed")
  } catch (error) {
    console.error("PDF service error:", error)
    throw error
  }
}

async function generatePDFWithPuppeteer(htmlContent: string, fileName: string) {
  let browser = null

  try {
    const puppeteer = await import("puppeteer")

    browser = await puppeteer.default.launch({
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
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    })

    const page = await browser.newPage()
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
        "Content-Disposition": `attachment; filename="${fileName}_report.pdf"`,
      },
    })
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    throw error
  }
}

function generateHTMLFallback(data: any) {
  const htmlContent = generatePDFHTML(data)

  return new NextResponse(htmlContent, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${data.fileName}_report.html"`,
    },
  })
}

function generatePDFHTML(data: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DataGenius Analysis Report - ${data.fileName}</title>
    <style>
        @page {
            margin: 0.75in;
            size: A4;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6; 
            color: #1f2937;
            font-size: 12px;
            background: white;
        }
        
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .title { 
            color: #3b82f6; 
            font-size: 28px; 
            font-weight: bold;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        
        .subtitle { 
            color: #6b7280; 
            font-size: 14px;
            margin-bottom: 0;
        }
        
        .section { 
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title { 
            color: #1f2937; 
            font-size: 18px; 
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 8px; 
            margin-bottom: 15px;
            page-break-after: avoid;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .summary-text {
            font-size: 14px;
            line-height: 1.7;
            color: #374151;
            margin: 0;
        }
        
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 20px;
        }
        
        .kpi-card { 
            border: 1px solid #d1d5db; 
            padding: 15px; 
            border-radius: 8px; 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            page-break-inside: avoid;
        }
        
        .kpi-label { 
            font-size: 11px; 
            color: #6b7280; 
            margin-bottom: 6px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .kpi-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1f2937;
            margin-bottom: 4px;
        }
        
        .kpi-change { 
            font-size: 11px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .kpi-change.positive {
            background: #dcfce7;
            color: #166534;
        }
        
        .kpi-change.negative {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .insight-list { 
            list-style: none; 
            padding: 0;
            margin: 0;
        }
        
        .insight-item { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            border-left: 4px solid #3b82f6; 
            padding: 15px; 
            margin-bottom: 12px; 
            border-radius: 0 8px 8px 0;
            page-break-inside: avoid;
            position: relative;
        }
        
        .insight-number {
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .insight-content {
            flex: 1;
            font-size: 13px;
            line-height: 1.6;
            color: #374151;
        }
        
        .insight-item-flex {
            display: flex;
            align-items: flex-start;
        }
        
        .chart-section {
            page-break-before: always;
        }
        
        .chart-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
            font-size: 11px;
            background: white;
        }
        
        .chart-table th, .chart-table td { 
            border: 1px solid #d1d5db; 
            padding: 10px 8px; 
            text-align: left;
        }
        
        .chart-table th { 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
            font-weight: 600;
            color: #374151;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .chart-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .chart-table tr:hover {
            background: #f0f9ff;
        }
        
        .percentage-bar {
            background: #e5e7eb;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 4px;
        }
        
        .percentage-fill {
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 10px; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px;
            page-break-inside: avoid;
        }
        
        .footer-logo {
            font-size: 16px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 8px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }
        
        .metadata {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
        }
        
        .metadata-item {
            font-size: 11px;
        }
        
        .metadata-label {
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metadata-value {
            color: #1f2937;
            font-weight: 500;
            margin-top: 2px;
        }

        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .kpi-card, .insight-item {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">📊 DataGenius Analysis Report</div>
        <div class="subtitle">Intelligent Data Analysis & Insights</div>
        
        <div class="metadata">
            <div class="metadata-grid">
                <div class="metadata-item">
                    <div class="metadata-label">File Name</div>
                    <div class="metadata-value">${data.fileName}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Generated</div>
                    <div class="metadata-value">${new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Data Points</div>
                    <div class="metadata-value">${data.rawData?.length || 0} rows</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Analysis Type</div>
                    <div class="metadata-value">AI-Powered</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🤖 Executive Summary</div>
        <div class="summary-box">
            <p class="summary-text">${data.summary}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📈 Key Performance Indicators</div>
        <div class="kpi-grid">
            ${
              data.kpis
                ?.map(
                  (kpi) => `
                <div class="kpi-card">
                    <div class="kpi-label">${kpi.label}</div>
                    <div class="kpi-value">${kpi.value}</div>
                    ${
                      kpi.change
                        ? `
                        <div class="kpi-change ${kpi.change.startsWith("+") ? "positive" : kpi.change.startsWith("-") ? "negative" : ""}">
                            ${kpi.change}
                        </div>
                    `
                        : ""
                    }
                </div>
            `,
                )
                .join("") || "<p>No KPIs available</p>"
            }
        </div>
    </div>

    <div class="section">
        <div class="section-title">🔍 Key Insights & Recommendations</div>
        <ul class="insight-list">
            ${
              data.insights
                ?.map(
                  (insight, index) => `
                <li class="insight-item">
                    <div class="insight-item-flex">
                        <div class="insight-number">${index + 1}</div>
                        <div class="insight-content">${insight}</div>
                    </div>
                </li>
            `,
                )
                .join("") || '<li class="insight-item">No insights available</li>'
            }
        </ul>
    </div>

    <div class="section chart-section">
        <div class="section-title">📊 Data Analysis Summary</div>
        <table class="chart-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Value</th>
                    <th>Percentage</th>
                    <th>Distribution</th>
                </tr>
            </thead>
            <tbody>
                ${
                  data.chartData
                    ?.slice(0, 20)
                    .map((item, index) => {
                      const total = data.chartData.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
                      const percentage = total > 0 ? (((Number(item.value) || 0) / total) * 100).toFixed(1) : "0"
                      return `
                    <tr>
                        <td><strong>${item.name || `Item ${index + 1}`}</strong></td>
                        <td>${typeof item.value === "number" ? item.value.toLocaleString() : item.value || "N/A"}</td>
                        <td>${percentage}%</td>
                        <td>
                            <div class="percentage-bar">
                                <div class="percentage-fill" style="width: ${percentage}%"></div>
                            </div>
                        </td>
                    </tr>
                `
                    })
                    .join("") || '<tr><td colspan="4">No chart data available</td></tr>'
                }
            </tbody>
        </table>
        ${
          data.chartData?.length > 20
            ? `
            <p style="margin-top: 15px; font-style: italic; color: #6b7280; font-size: 11px;">
                Showing top 20 of ${data.chartData.length} data points
            </p>
        `
            : ""
        }
    </div>

    <div class="footer">
        <div class="footer-logo">DataGenius AI</div>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p>This report contains AI-generated insights based on your uploaded data analysis.</p>
        <p>For questions or support, visit our website or contact our team.</p>
        <p style="margin-top: 10px; font-size: 9px; color: #9ca3af;">
            © ${new Date().getFullYear()} DataGenius. All rights reserved. | Powered by AI Technology
        </p>
    </div>
</body>
</html>`
}
