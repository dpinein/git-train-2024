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
  const fileName = file.name
  const fileType = getFileTypeFromName(fileName)

  console.log(`Fast parsing: ${fileName}, type: ${fileType}`)

  // For fast deployment, we'll handle CSV and basic text files
  // Other formats will be processed as metadata only
  switch (fileType) {
    case "csv":
      return await parseCSV(file, fileName)
    case "txt":
      return await parseText(file, fileName)
    default:
      return await parseGeneric(file, fileName, fileType)
  }
}

function getFileTypeFromName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase()
  const typeMap: { [key: string]: string } = {
    csv: "csv",
    txt: "txt",
    xlsx: "excel",
    xls: "excel",
    pdf: "pdf",
    docx: "word",
  }
  return typeMap[extension || ""] || "unknown"
}

async function parseCSV(file: File, fileName: string): Promise<ParsedData> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const dataLines = lines.slice(1)

  const rows = dataLines.map((line) => {
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

async function parseText(file: File, fileName: string): Promise<ParsedData> {
  const text = await file.text()
  const lines = text.split(/\r?\n/)

  const headers = ["Line_Number", "Content", "Length"]
  const rows = lines
    .map((line, index) => ({
      Line_Number: index + 1,
      Content: line.trim().substring(0, 200),
      Length: line.trim().length,
    }))
    .filter((row) => row.Content.length > 0)

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

async function parseGeneric(file: File, fileName: string, fileType: string): Promise<ParsedData> {
  // For non-CSV/TXT files, create metadata-only response
  const headers = ["Property", "Value"]
  const rows = [
    { Property: "File_Name", Value: fileName },
    { Property: "File_Size_KB", Value: Math.round(file.size / 1024) },
    { Property: "File_Type", Value: fileType.toUpperCase() },
    { Property: "Status", Value: "File uploaded successfully" },
    { Property: "Note", Value: "Advanced parsing available in full version" },
  ]

  return {
    headers,
    rows,
    metadata: {
      fileName,
      fileType,
      rowCount: rows.length,
      columnCount: headers.length,
    },
  }
}
