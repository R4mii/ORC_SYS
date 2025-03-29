"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainSidebar } from "./sidebar"

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  // Read from localStorage to get the user's preference, defaulting to expanded
  const [defaultOpen, setDefaultOpen] = React.useState(true)

  React.useEffect(() => {
    const storedState = localStorage.getItem("sidebar:state")
    if (storedState) {
      setDefaultOpen(storedState === "true")
    }
  }, [])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MainSidebar />
      <SidebarInset className="p-4 md:p-6">{children}</SidebarInset>
    </SidebarProvider>
  )
}

