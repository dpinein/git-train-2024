"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Share2, TrendingUp, TrendingDown, Minus, Check, FileText } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface DashboardProps {
  data: {
    summary: string
    insights: string[]
    chartData: any[]
    kpis: { label: string; value: string; change?: string }[]
    rawData: any[]
    fileName: string
  }
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"]

export function Dashboard({ data }: DashboardProps) {
  const { summary, insights, chartData, kpis } = data
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const downloadExcel = async () => {
    try {
      setIsExporting(true)
      const response = await fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.fileName}_analysis.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Excel Export Successful",
        description: "Your analysis has been downloaded as an Excel file.",
      })
    } catch (error) {
      console.error("Excel export failed:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export Excel file",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadPDF = async () => {
    try {
      setIsExporting(true)

      toast({
        title: "Generating Report...",
        description: "Creating your PDF report",
      })

      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // If PDF fails, try HTML export as fallback
        console.log("PDF failed, trying HTML fallback...")
        return await downloadHTML()
      }

      const contentType = response.headers.get("content-type")
      const blob = await response.blob()

      if (contentType?.includes("application/pdf")) {
        // Success - got PDF
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${data.fileName}_analysis_report.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: "PDF Export Successful",
          description: "Your analysis report has been downloaded as a PDF.",
        })
      } else {
        // Got HTML fallback
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${data.fileName}_analysis_report.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: "HTML Report Downloaded",
          description: "PDF generation unavailable - downloaded as HTML report instead.",
        })
      }
    } catch (error) {
      console.error("Report export failed:", error)
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadHTML = async () => {
    try {
      const response = await fetch("/api/export-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("HTML export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.fileName}_analysis_report.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "HTML Report Downloaded",
        description: "Your analysis has been saved as an interactive HTML report.",
      })
    } catch (error) {
      console.error("HTML export failed:", error)
      throw error
    }
  }

  const shareDashboard = async () => {
    try {
      setIsSharing(true)

      // Create a shareable summary
      const shareText = `📊 DataGenius Analysis Report

File: ${data.fileName}
Generated: ${new Date().toLocaleDateString()}

📈 Key Insights:
${insights
  .slice(0, 3)
  .map((insight, i) => `${i + 1}. ${insight}`)
  .join("\n")}

🔢 Top KPIs:
${kpis
  .slice(0, 3)
  .map((kpi) => `• ${kpi.label}: ${kpi.value}`)
  .join("\n")}

🤖 AI Summary:
${summary.substring(0, 200)}${summary.length > 200 ? "..." : ""}

Generated by DataGenius AI - Turn your data into insights instantly!`

      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `DataGenius Analysis - ${data.fileName}`,
          text: shareText,
          url: window.location.href,
        })

        toast({
          title: "Shared Successfully",
          description: "Your dashboard has been shared!",
        })
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Copied to Clipboard",
          description: "Dashboard summary copied! You can now paste it anywhere.",
        })
      }
    } catch (error) {
      console.error("Share failed:", error)

      // Final fallback: Show share text in alert
      const shareUrl = window.location.href
      const fallbackText = `Check out my DataGenius analysis: ${shareUrl}`

      try {
        await navigator.clipboard.writeText(fallbackText)
        toast({
          title: "Link Copied",
          description: "Dashboard link copied to clipboard!",
        })
      } catch (clipboardError) {
        toast({
          title: "Share Dashboard",
          description: `Copy this link: ${shareUrl}`,
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  const getTrendIcon = (change?: string) => {
    if (!change) return <Minus className="h-4 w-4" />
    const isPositive = change.startsWith("+")
    const isNegative = change.startsWith("-")

    if (isPositive) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (isNegative) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <Button variant="outline" onClick={downloadExcel} disabled={isExporting} className="bg-white">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Excel"}
        </Button>
        <Button variant="outline" onClick={downloadPDF} disabled={isExporting} className="bg-white">
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? "Generating..." : "Export Report"}
        </Button>
        <Button variant="outline" onClick={shareDashboard} disabled={isSharing} className="bg-white">
          {copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Share2 className="h-4 w-4 mr-2" />}
          {isSharing ? "Sharing..." : copied ? "Copied!" : "Share Dashboard"}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium">{kpi.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(kpi.change)}
                    <span
                      className={`text-sm font-medium ${
                        kpi.change.startsWith("+")
                          ? "text-green-600"
                          : kpi.change.startsWith("-")
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🤖 AI Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Data Overview</CardTitle>
            <CardDescription>Key metrics visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Value",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Data trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                trend: {
                  label: "Trend",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Analysis</CardTitle>
          <CardDescription>Proportional breakdown of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
            <div className="flex-1">
              <ChartContainer
                config={{
                  distribution: {
                    label: "Distribution",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="space-y-2">
              {chartData.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Key Insights</CardTitle>
          <CardDescription>AI-discovered patterns and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">
                  {index + 1}
                </Badge>
                <p className="text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
