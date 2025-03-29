"use client"

import type * as React from "react"
import { MainSidebar } from "./sidebar"

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <div className="flex min-h-screen">
      <MainSidebar />
      <main className="flex-1 pl-[var(--sidebar-width)] transition-all duration-300">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

