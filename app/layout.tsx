"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

// Metadata needs to be in a separate file when using 'use client'
export const metadata: Metadata = {
  title: "ORCSYS - Financial Document Processing",
  description: "Streamline your financial workflows with cutting-edge OCR technology",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            {/* Only render the Navbar on non-dashboard pages */}
            {!isDashboard && <Navbar />}
            <main className="flex-grow">{children}</main>
            {/* Only render the Footer on non-dashboard pages */}
            {!isDashboard && <Footer />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
