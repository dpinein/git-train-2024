import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { xai } from "@ai-sdk/xai"
import { z } from "zod"
import { parseFile } from "@/lib/excel-parser"
import { neon } from "@neondatabase/serverless"
import { auth } from "@clerk/nextjs/server"

const DataAnalysisSchema = z.object({
  summary: z.string().describe("A comprehensive summary of the data in 2-3 sentences"),
  insights: z.array(z.string()).describe("5-7 key insights discovered from the data"),
  kpis: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        change: z.string().optional(),
      }),
    )
    .describe("4-6 key performance indicators with values and optional change percentages"),
  chartData: z
    .array(
      z.object({
        name: z.string(),
        value: z.number(),
      }),
    )
    .describe("Data formatted for charts with name-value pairs"),
  recommendations: z.array(z.string()).describe("3-5 actionable recommendations based on the data"),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`Processing uploaded file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Parse the ACTUAL uploaded file
    let parsedData
    try {
      parsedData = await parseFile(file)
      console.log(`Successfully parsed: ${parsedData.rows.length} rows, ${parsedData.headers.length} columns`)
      console.log(`Headers: ${parsedData.headers.join(", ")}`)
      console.log(`Sample data:`, parsedData.rows.slice(0, 2))
    } catch (parseError) {
      console.error("File parsing error:", parseError)
      return NextResponse.json(
        {
          error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        },
        { status: 400 },
      )
    }

    // Create AI analysis prompt based on ACTUAL parsed data
    const dataPreview = parsedData.rows.slice(0, 10)
    const prompt = `Analyze this REAL data that was just uploaded and parsed from the user's ${parsedData.metadata.fileType} file.

IMPORTANT: This is actual user data, not sample data. Base your analysis entirely on what you see below.

File Information:
- Original filename: ${parsedData.metadata.fileName}
- File type: ${parsedData.metadata.fileType}
- Total rows: ${parsedData.metadata.rowCount}
- Total columns: ${parsedData.metadata.columnCount}

Data Structure:
Column headers: ${parsedData.headers.join(", ")}

Actual Data Sample (first 10 rows):
${JSON.stringify(dataPreview, null, 2)}

Please analyze this SPECIFIC data and provide:
1. Summary based on what you actually see in the data
2. Insights derived from the real values and patterns
3. KPIs calculated from the actual numbers in the dataset
4. Chart data using real values from the columns
5. Recommendations based on the actual data patterns

Do NOT use generic examples. Use the real data provided above.`

    console.log("Sending to AI for analysis...")

    // Use AI to analyze the REAL parsed data
    const { object: analysis } = await generateObject({
      model: xai("grok-3"),
      schema: DataAnalysisSchema,
      prompt: prompt,
    })

    console.log("AI analysis completed")

    // Save to database if user is authenticated
    if (userId && process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL)
        await sql`
          INSERT INTO analyses (user_id, file_name, file_type, row_count, column_count, analysis_data)
          VALUES (${userId}, ${parsedData.metadata.fileName}, ${parsedData.metadata.fileType}, ${parsedData.metadata.rowCount}, ${parsedData.metadata.columnCount}, ${JSON.stringify(
            {
              ...analysis,
              rawData: parsedData.rows,
              headers: parsedData.headers,
              metadata: parsedData.metadata,
            },
          )})
        `
        console.log("Data saved to database")
      } catch (dbError) {
        console.error("Database save error:", dbError)
        // Continue without saving to DB
      }
    }

    return NextResponse.json({
      ...analysis,
      rawData: parsedData.rows,
      headers: parsedData.headers,
      fileName: parsedData.metadata.fileName,
      metadata: parsedData.metadata,
    })
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json(
      {
        error: `Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
