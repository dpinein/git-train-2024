// Check if we're in build environment
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.VERCEL_URL

// Conditional imports to avoid build-time issues
let mammoth: any = null
if (!isBuildTime) {
  try {
    mammoth = require("mammoth")
  } catch (e) {
    console.warn("Mammoth not available:", e)
  }
}

import * as XLSX from "xlsx"
// import mammoth from "mammoth" // Removed redundant import

export interface ParsedData {
  headers: string[]
  rows: any[]
  metadata: {
    fileName: string
    fileType: string
    rowCount: number
    columnCount: number
  }
}

export async function parseFile(file: File): Promise<ParsedData> {
  const buffer = await file.arrayBuffer()
  const fileName = file.name
  const fileType = file.type || getFileTypeFromName(fileName)

  console.log(`Parsing file: ${fileName}, type: ${fileType}, size: ${buffer.byteLength}`)

  try {
    switch (true) {
      case fileType.includes("spreadsheet") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls"):
        return await parseExcel(buffer, fileName)

      case fileType.includes("csv") || fileName.endsWith(".csv"):
        return await parseCSV(buffer, fileName)

      case fileType.includes("pdf") || fileName.endsWith(".pdf"):
        return await parsePDF(buffer, fileName)

      case fileType.includes("wordprocessingml") || fileName.endsWith(".docx"):
        return await parseWord(buffer, fileName)

      case fileType.includes("text") || fileName.endsWith(".txt"):
        return await parseText(buffer, fileName)

      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error(`Error parsing file ${fileName}:`, error)
    throw new Error(`Failed to parse ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function getFileTypeFromName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase()
  const typeMap: { [key: string]: string } = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
  }
  return typeMap[extension || ""] || "unknown"
}

async function parseExcel(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    const workbook = XLSX.read(buffer, { type: "array" })

    if (!workbook.SheetNames.length) {
      throw new Error("Excel file contains no sheets")
    }

    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    if (!worksheet) {
      throw new Error("Could not read Excel worksheet")
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length === 0) {
      throw new Error("Excel file is empty")
    }

    // Handle case where first row might be empty
    let headerRowIndex = 0
    while (
      headerRowIndex < jsonData.length &&
      (!jsonData[headerRowIndex] || jsonData[headerRowIndex].every((cell) => !cell))
    ) {
      headerRowIndex++
    }

    if (headerRowIndex >= jsonData.length) {
      throw new Error("No data found in Excel file")
    }

    const headers = jsonData[headerRowIndex]?.map((h, i) => String(h || `Column_${i + 1}`)) || []
    const dataRows = jsonData
      .slice(headerRowIndex + 1)
      .filter((row) => row && row.some((cell) => cell !== null && cell !== undefined && cell !== ""))

    const rows = dataRows.map((row) => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : null
      })
      return obj
    })

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "excel",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function parseCSV(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    const text = new TextDecoder("utf-8").decode(buffer)

    if (!text.trim()) {
      throw new Error("CSV file is empty")
    }

    const lines = text.split(/\r?\n/).filter((line) => line.trim())

    if (lines.length === 0) {
      throw new Error("No data found in CSV file")
    }

    // Simple CSV parsing (handles basic cases)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0]).map((h, i) => h || `Column_${i + 1}`)
    const dataLines = lines.slice(1).filter((line) => line.trim())

    const rows = dataLines.map((line) => {
      const values = parseCSVLine(line)
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || null
      })
      return obj
    })

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "csv",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function parsePDF(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    // Production-safe PDF handling without external dependencies
    const text = await extractBasicPDFText(buffer)

    const lines = text.split("\n").filter((line) => line.trim())

    // Look for structured data patterns
    const dataLines = lines.filter((line) => {
      const trimmed = line.trim()
      // Look for lines with numbers, dates, or structured content
      return (
        trimmed.length > 5 &&
        (/\d+/.test(trimmed) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(trimmed) || trimmed.split(/\s+/).length >= 3)
      )
    })

    const headers = ["Line_Number", "Content", "Data_Type"]
    const rows = dataLines.slice(0, 100).map((line, index) => {
      // Limit to first 100 lines
      const trimmed = line.trim()
      let dataType = "Text"

      if (/\$?\d+\.?\d*/.test(trimmed)) dataType = "Numeric"
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(trimmed)) dataType = "Date"
      if (trimmed.split(/\s+/).length >= 5) dataType = "Structured"

      return {
        Line_Number: index + 1,
        Content: trimmed.substring(0, 200), // Limit content length
        Data_Type: dataType,
      }
    })

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "pdf",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    // Fallback for PDF files
    const headers = ["Property", "Value"]
    const rows = [
      { Property: "File_Name", Value: fileName },
      { Property: "File_Size_KB", Value: Math.round(buffer.byteLength / 1024) },
      { Property: "File_Type", Value: "PDF Document" },
      { Property: "Status", Value: "Uploaded successfully - content extraction limited" },
    ]

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "pdf",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  }
}

async function extractBasicPDFText(buffer: ArrayBuffer): Promise<string> {
  // Basic PDF text extraction without dependencies
  const uint8Array = new Uint8Array(buffer)
  const text = new TextDecoder("latin1").decode(uint8Array)

  // Extract text between parentheses (common PDF text encoding)
  const textMatches = text.match(/$$([^)]+)$$/g) || []
  const extractedText = textMatches
    .map((match) => match.slice(1, -1))
    .filter((text) => text.length > 1 && /[a-zA-Z0-9]/.test(text))
    .join("\n")

  return extractedText || "PDF content extraction limited"
}

async function parseWord(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    if (!mammoth) {
      throw new Error("Word document parsing not available in build environment")
    }

    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    const text = result.value

    if (!text.trim()) {
      throw new Error("Word document appears to be empty")
    }

    const paragraphs = text.split(/\n+/).filter((para) => para.trim())

    const headers = ["Paragraph_Number", "Content", "Word_Count", "Character_Count"]
    const rows = paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim()
      return {
        Paragraph_Number: index + 1,
        Content: trimmed.substring(0, 500), // Limit content length
        Word_Count: trimmed.split(/\s+/).length,
        Character_Count: trimmed.length,
      }
    })

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "word",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    // Fallback for Word documents when mammoth is not available
    const headers = ["Property", "Value"]
    const rows = [
      { Property: "File_Name", Value: fileName },
      { Property: "File_Size_KB", Value: Math.round(buffer.byteLength / 1024) },
      { Property: "File_Type", Value: "Word Document" },
      { Property: "Status", Value: "Uploaded successfully - content extraction limited in build environment" },
    ]

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "word",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  }
}

async function parseText(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    const text = new TextDecoder("utf-8").decode(buffer)

    if (!text.trim()) {
      throw new Error("Text file is empty")
    }

    const lines = text.split(/\r?\n/)

    const headers = ["Line_Number", "Content", "Length", "Type"]
    const rows = lines
      .map((line, index) => {
        const trimmed = line.trim()
        let type = "Empty"

        if (trimmed.length > 0) {
          if (/^\d+/.test(trimmed)) type = "Numeric"
          else if (/^[A-Z]/.test(trimmed)) type = "Title"
          else if (trimmed.includes(",")) type = "Data"
          else type = "Text"
        }

        return {
          Line_Number: index + 1,
          Content: trimmed.substring(0, 200), // Limit content length
          Length: trimmed.length,
          Type: type,
        }
      })
      .filter((row) => row.Content.length > 0) // Remove empty lines

    return {
      headers,
      rows,
      metadata: {
        fileName,
        fileType: "text",
        rowCount: rows.length,
        columnCount: headers.length,
      },
    }
  } catch (error) {
    throw new Error(`Text file parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
