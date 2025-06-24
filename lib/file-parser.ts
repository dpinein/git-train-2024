import * as XLSX from "xlsx"
import mammoth from "mammoth"

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

  switch (true) {
    case fileType.includes("spreadsheet") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls"):
      return parseExcel(buffer, fileName)

    case fileType.includes("csv") || fileName.endsWith(".csv"):
      return parseCSV(buffer, fileName)

    case fileType.includes("pdf") || fileName.endsWith(".pdf"):
      return parsePDF(buffer, fileName)

    case fileType.includes("wordprocessingml") || fileName.endsWith(".docx"):
      return parseWord(buffer, fileName)

    case fileType.includes("text") || fileName.endsWith(".txt"):
      return parseText(buffer, fileName)

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
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
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

  if (jsonData.length === 0) {
    throw new Error("Excel file is empty")
  }

  const headers = jsonData[0]?.map(String) || []
  const rows = jsonData.slice(1).filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))

  return {
    headers,
    rows: rows.map((row) => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || null
      })
      return obj
    }),
    metadata: {
      fileName,
      fileType: "excel",
      rowCount: rows.length,
      columnCount: headers.length,
    },
  }
}

async function parseCSV(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  const text = new TextDecoder().decode(buffer)
  const lines = text.split("\n").filter((line) => line.trim())

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
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
}

async function parsePDF(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  try {
    // For production, we'll use a simpler PDF text extraction approach
    // that doesn't rely on pdf-parse which has build issues
    const text = await extractPDFText(buffer)

    // Try to extract tabular data from PDF text
    const lines = text.split("\n").filter((line) => line.trim())

    // Simple heuristic: look for lines with multiple numbers or consistent patterns
    const dataLines = lines.filter((line) => {
      const numbers = line.match(/\d+/g)
      return numbers && numbers.length >= 2
    })

    const headers = ["Line", "Content", "Numbers"]
    const rows = dataLines.map((line, index) => ({
      Line: index + 1,
      Content: line.trim(),
      Numbers: (line.match(/\d+/g) || []).join(", "),
    }))

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
    // Fallback: treat PDF as binary data and extract basic info
    const text = `PDF file: ${fileName}\nSize: ${buffer.byteLength} bytes\nNote: PDF text extraction not available in this environment`

    const headers = ["Property", "Value"]
    const rows = [
      { Property: "File Name", Value: fileName },
      { Property: "File Size", Value: `${(buffer.byteLength / 1024).toFixed(2)} KB` },
      { Property: "File Type", Value: "PDF Document" },
      { Property: "Status", Value: "Upload successful - manual review recommended" },
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

async function parseWord(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
  const text = result.value

  const lines = text.split("\n").filter((line) => line.trim())

  const headers = ["Paragraph", "Content", "Word Count"]
  const rows = lines.map((line, index) => ({
    Paragraph: index + 1,
    Content: line.trim(),
    "Word Count": line.trim().split(" ").length,
  }))

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

async function parseText(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  const text = new TextDecoder().decode(buffer)
  const lines = text.split("\n").filter((line) => line.trim())

  const headers = ["Line", "Content", "Length"]
  const rows = lines.map((line, index) => ({
    Line: index + 1,
    Content: line.trim(),
    Length: line.trim().length,
  }))

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
}

async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  // Simple PDF text extraction without external dependencies
  // This is a basic implementation - for production you might want to use a different approach
  const uint8Array = new Uint8Array(buffer)
  const text = new TextDecoder("latin1").decode(uint8Array)

  // Extract readable text from PDF binary
  const textMatches = text.match(/$$([^)]+)$$/g) || []
  const extractedText = textMatches
    .map((match) => match.slice(1, -1))
    .filter((text) => text.length > 2 && /[a-zA-Z]/.test(text))
    .join(" ")

  return extractedText || "PDF content could not be extracted"
}
