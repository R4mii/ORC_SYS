import type React from "react"
import type { Metadata } from "next"
import { Inter } from "@next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/ui/use-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ORCSYS - Financial Document Processing",
  description: "Streamline your financial workflows with cutting-edge OCR technology",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
