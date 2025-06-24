"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Dashboard } from "@/components/dashboard"
import { DataChat } from "@/components/data-chat"
import { Header } from "@/components/header"
import { PricingSection } from "@/components/pricing-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Brain, FileText, Zap } from "lucide-react"

interface ProcessedData {
  summary: string
  insights: string[]
  chartData: any[]
  kpis: { label: string; value: string; change?: string }[]
  rawData: any[]
  fileName: string
}

export default function HomePage() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDataProcessed = (data: ProcessedData) => {
    try {
      setProcessedData(data)
      setIsProcessing(false)
    } catch (error) {
      console.error("Error processing data:", error)
      setIsProcessing(false)
    }
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setProcessedData(null) // Clear previous data
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {!processedData ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Turn Raw Data Into Smart Dashboards
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload Excel, CSV, PDF, or any data file. Our AI automatically cleans, analyzes, and creates beautiful
                dashboards in seconds.
              </p>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-4 gap-6 mt-12">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardHeader className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-blue-600" />
                    <CardTitle className="text-lg">Multi-Format Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Excel, CSV, PDF, Word, Text, SQL dumps</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardHeader className="text-center">
                    <Brain className="h-8 w-8 mx-auto text-purple-600" />
                    <CardTitle className="text-lg">AI-Powered Cleaning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Automatic data cleaning and structuring</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardHeader className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-green-600" />
                    <CardTitle className="text-lg">Smart Dashboards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Auto-generated charts and insights</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardHeader className="text-center">
                    <Zap className="h-8 w-8 mx-auto text-orange-600" />
                    <CardTitle className="text-lg">Instant Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Get insights in under 30 seconds</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="max-w-4xl mx-auto">
              <FileUpload
                onDataProcessed={handleDataProcessed}
                onProcessingStart={handleProcessingStart}
                isProcessing={isProcessing}
              />
            </div>

            {/* Pricing Section */}
            <PricingSection />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Dashboard: {processedData.fileName}</h2>
                <p className="text-gray-600">AI-generated insights and visualizations</p>
              </div>
              <button
                onClick={() => setProcessedData(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload New File
              </button>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="chat">Ask Your Data</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard data={processedData} />
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <DataChat data={processedData} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
