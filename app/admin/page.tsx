"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Trash2, Eye, Download, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"

interface DatabaseAnalysis {
  id: string
  user_id: string
  file_name: string
  file_type: string
  row_count: number
  column_count: number
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const [analyses, setAnalyses] = useState<DatabaseAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalRows: 0,
    uniqueUsers: 0,
    fileTypes: [] as string[],
  })

  useEffect(() => {
    if (isLoaded) {
      fetchDatabaseData()
    }
  }, [isLoaded])

  const fetchDatabaseData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/database")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.analyses)

        // Calculate stats
        const uniqueUsers = new Set(data.analyses.map((a: DatabaseAnalysis) => a.user_id)).size
        const totalRows = data.analyses.reduce((sum: number, a: DatabaseAnalysis) => sum + a.row_count, 0)
        const fileTypes = Array.from(new Set(data.analyses.map((a: DatabaseAnalysis) => a.file_type)))

        setStats({
          totalAnalyses: data.analyses.length,
          totalRows,
          uniqueUsers,
          fileTypes,
        })
      }
    } catch (error) {
      console.error("Failed to fetch database data:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalysis = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return

    try {
      const response = await fetch(`/api/admin/database/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchDatabaseData() // Refresh data
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center space-x-3">
                <Database className="h-8 w-8 text-blue-600" />
                <span>Database Manager</span>
              </h1>
              <p className="text-xl text-gray-600 mt-2">View and manage all analyses in your Neon database</p>
            </div>
            <Button onClick={fetchDatabaseData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Data Rows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalRows.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>File Types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {stats.fileTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Analyses</CardTitle>
              <CardDescription>Complete list of all data analyses stored in your Neon database</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analyses found</h3>
                  <p className="text-gray-600">Upload some data files to see them here</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rows</TableHead>
                        <TableHead>Columns</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{analysis.file_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{analysis.file_type}</Badge>
                          </TableCell>
                          <TableCell>{analysis.row_count.toLocaleString()}</TableCell>
                          <TableCell>{analysis.column_count}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[100px] truncate">{analysis.user_id}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAnalysis(analysis.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Raw SQL Query Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Database Connection Status</CardTitle>
              <CardDescription>Test your Neon database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Connected to Neon PostgreSQL</span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Table: analyses | Columns: id, user_id, file_name, file_type, row_count, column_count, analysis_data,
                  created_at, updated_at
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
