"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@clerk/nextjs"

interface FileUploadProps {
  onDataProcessed: (data: any) => void
  onProcessingStart: () => void
  isProcessing: boolean
}

export function FileUpload({ onDataProcessed, onProcessingStart, isProcessing }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { user, isSignedIn } = useUser()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      console.log("File selected:", file.name, file.type, file.size)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const processFile = async () => {
    if (!uploadedFile) return

    console.log("Starting file processing for:", uploadedFile.name)
    onProcessingStart()
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      if (user) {
        formData.append("userId", user.id)
      }

      console.log("Uploading file to API...")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/process-data", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      const result = await response.json()
      console.log("File processing completed:", result)
      onDataProcessed(result)
    } catch (err) {
      console.error("Processing error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setProgress(0)
    }
  }

  const getFileTypeInfo = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "csv":
        return { status: "full", message: "Full analysis available" }
      case "txt":
        return { status: "full", message: "Full text analysis available" }
      case "xlsx":
      case "xls":
        return { status: "limited", message: "Convert to CSV for full analysis" }
      default:
        return { status: "limited", message: "Limited analysis available" }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Upload className="h-6 w-6" />
            <span>Upload Your Data File</span>
          </CardTitle>
          <CardDescription>
            Best support: CSV and TXT files. Excel files will be processed with limited analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`p-8 text-center cursor-pointer rounded-lg transition-colors ${
              isDragActive ? "bg-blue-50 border-blue-300" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop your file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                <p className="text-sm text-gray-500">CSV, TXT, Excel files up to 10MB</p>
              </div>
            )}
          </div>

          {!isSignedIn && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Sign in to save your analyses and access them later!
              </p>
            </div>
          )}

          {uploadedFile && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">{uploadedFile.name}</span>
                  <span className="text-green-600 text-sm">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>

              {(() => {
                const fileInfo = getFileTypeInfo(uploadedFile.name)
                return (
                  <Alert
                    className={
                      fileInfo.status === "full" ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
                    }
                  >
                    <Info className="h-4 w-4" />
                    <AlertDescription className={fileInfo.status === "full" ? "text-green-800" : "text-orange-800"}>
                      {fileInfo.message}
                    </AlertDescription>
                  </Alert>
                )
              })()}
            </div>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing your actual data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 text-center">
                AI is analyzing your uploaded file. This may take a few moments.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={processFile}
              disabled={!uploadedFile || isProcessing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? "Processing Your File..." : "Analyze My Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Files */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">📊 For Best Results</CardTitle>
          <CardDescription>Upload CSV files for complete data analysis and visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Fully Supported:</strong> CSV, TXT files
            </p>
            <p>
              <strong>⚠️ Limited Support:</strong> Excel files (convert to CSV recommended)
            </p>
            <p>
              <strong>💡 Tip:</strong> Open Excel → Save As → CSV format for best results
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
