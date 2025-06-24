"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, Download, Eye } from "lucide-react"
import { Header } from "@/components/header"

interface Analysis {
  id: string
  fileName: string
  fileType: string
  rowCount: number
  columnCount: number
  createdAt: string
  analysisData: any
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalyses()
    }
  }, [isLoaded, user])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch("/api/user-analyses")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses)
      }
    } catch (error) {
      console.error("Failed to fetch analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome back, {user.firstName || "User"}!</h1>
            <p className="text-xl text-gray-600">Here are your data analysis results</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Files Processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyses.reduce((sum, a) => sum + a.rowCount, 0)}</div>
                <p className="text-xs text-gray-500">Total rows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most Recent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyses.length > 0 ? new Date(analyses[0]?.createdAt).toLocaleDateString() : "No data"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>File Types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(analyses.map((a) => a.fileType))).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyses List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Analyses</h2>
              <Button asChild>
                <a href="/">Upload New File</a>
              </Button>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
                  <p className="text-gray-600 mb-4">Upload your first data file to get started</p>
                  <Button asChild>
                    <a href="/">Upload File</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg truncate">{analysis.fileName}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{analysis.fileType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Rows:</span>
                          <span className="font-medium">{analysis.rowCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Columns:</span>
                          <span className="font-medium">{analysis.columnCount}</span>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
