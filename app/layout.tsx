import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SafeClerkProvider } from "@/components/providers/clerk-provider"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DataGenius - AI-Powered Data Analysis & Dashboards",
  description:
    "Turn raw data files into intelligent dashboards automatically. Upload Excel, CSV, PDF, or any data file and get instant insights powered by AI.",
  keywords: "data analysis, AI dashboards, business intelligence, Papua New Guinea, data visualization",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SafeClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </SafeClerkProvider>
  )
}
