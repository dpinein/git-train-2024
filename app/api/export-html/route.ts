import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generate comprehensive HTML report
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>DataGenius Analysis Report - ${data.fileName}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6; 
            color: #1f2937;
            background: #f9fafb;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 30px; 
            margin-bottom: 40px;
        }
        
        .title { 
            color: #3b82f6; 
            font-size: 36px; 
            font-weight: bold;
            margin-bottom: 12px;
        }
        
        .subtitle { 
            color: #6b7280; 
            font-size: 18px;
        }
        
        .section { 
            margin-bottom: 40px;
        }
        
        .section-title { 
            color: #1f2937; 
            font-size: 24px; 
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 30px;
            border-radius: 12px;
            border-left: 6px solid #3b82f6;
            margin-bottom: 30px;
        }
        
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        
        .kpi-card { 
            border: 1px solid #d1d5db; 
            padding: 24px; 
            border-radius: 12px; 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
        }
        
        .kpi-label { 
            font-size: 14px; 
            color: #6b7280; 
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 1px;
        }
        
        .kpi-value { 
            font-size: 32px; 
            font-weight: bold; 
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .insight-list { 
            list-style: none; 
            padding: 0;
            margin: 0;
        }
        
        .insight-item { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            border-left: 6px solid #3b82f6; 
            padding: 24px; 
            margin-bottom: 16px; 
            border-radius: 0 12px 12px 0;
            display: flex;
            align-items: flex-start;
        }
        
        .insight-number {
            background: #3b82f6;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .chart-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .chart-table th, .chart-table td { 
            padding: 16px 12px; 
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .chart-table th { 
            background: #f8fafc; 
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
        }
        
        .chart-table tr:hover {
            background: #f0f9ff;
        }
        
        .footer { 
            margin-top: 60px; 
            text-align: center; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 30px;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .print-button:hover {
            background: #2563eb;
        }
        
        @media print {
            .print-button { display: none; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print Report</button>
    
    <div class="container">
        <div class="header">
            <div class="title">📊 DataGenius Analysis Report</div>
            <div class="subtitle">File: ${data.fileName} | Generated: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
            <div class="section-title">🤖 Executive Summary</div>
            <div class="summary-box">
                <p style="font-size: 16px; margin: 0;">${data.summary}</p>
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
                        ${kpi.change ? `<div style="color: ${kpi.change.startsWith("+") ? "#059669" : "#dc2626"}; font-weight: 600;">${kpi.change}</div>` : ""}
                    </div>
                `,
                    )
                    .join("") || "<p>No KPIs available</p>"
                }
            </div>
        </div>

        <div class="section">
            <div class="section-title">🔍 Key Insights</div>
            <ul class="insight-list">
                ${
                  data.insights
                    ?.map(
                      (insight, index) => `
                    <li class="insight-item">
                        <div class="insight-number">${index + 1}</div>
                        <div style="flex: 1; font-size: 15px;">${insight}</div>
                    </li>
                `,
                    )
                    .join("") || '<li class="insight-item">No insights available</li>'
                }
            </ul>
        </div>

        <div class="section">
            <div class="section-title">📊 Data Summary</div>
            <table class="chart-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Value</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      data.chartData
                        ?.slice(0, 25)
                        .map((item) => {
                          const total = data.chartData.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
                          const percentage = total > 0 ? (((Number(item.value) || 0) / total) * 100).toFixed(1) : "0"
                          return `
                        <tr>
                            <td style="font-weight: 600;">${item.name}</td>
                            <td>${typeof item.value === "number" ? item.value.toLocaleString() : item.value}</td>
                            <td>${percentage}%</td>
                        </tr>
                    `
                        })
                        .join("") || '<tr><td colspan="3">No data available</td></tr>'
                    }
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p style="font-size: 18px; font-weight: bold; color: #3b82f6; margin-bottom: 10px;">DataGenius AI</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>This report contains AI-generated insights based on your data analysis.</p>
        </div>
    </div>
</body>
</html>`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${data.fileName}_analysis_report.html"`,
      },
    })
  } catch (error) {
    console.error("HTML export error:", error)
    return NextResponse.json(
      { error: "Failed to generate HTML report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
