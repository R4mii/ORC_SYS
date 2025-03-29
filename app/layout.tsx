import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Experio - Système de comptabilité",
  description: "Système de comptabilité avec OCR pour la gestion des factures",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  )
}



import './globals.css'