import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    const { question, data } = await request.json()

    // Optional: You could check if user is authenticated for premium features
    // if (!userId) {
    //   return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    // }

    const { text } = await generateText({
      model: xai("grok-3"),
      prompt: `You are a helpful data analyst AI assistant. A user has uploaded a data file and you have analyzed it. Now they're asking a question about their data.

Data Summary: ${data.summary}
Key Insights: ${data.insights.join(", ")}
KPIs: ${data.kpis.map((kpi: any) => `${kpi.label}: ${kpi.value}`).join(", ")}
Sample Data: ${JSON.stringify(data.rawData.slice(0, 5))}

User Question: ${question}

Provide a helpful, accurate answer based on the data analysis. Be conversational but professional. If the question can't be answered from the available data, explain what additional information would be needed.

Keep your response concise but informative (2-4 sentences).`,
    })

    return NextResponse.json({ answer: text })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 })
  }
}
