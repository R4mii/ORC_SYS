"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Upload, FileText, BarChart, Search, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  color?: string
  description: string
}

export function QuickActionsWidget() {
  // Predefined actions
  const quickActions: QuickAction[] = [
    {
      id: "upload",
      label: "Upload Document",
      icon: <Upload className="h-5 w-5" />,
      href: "/dashboard/upload",
      color: "text-blue-500",
      description: "Upload a new document for processing",
    },
    {
      id: "process",
      label: "Process Documents",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/process",
      color: "text-green-500",
      description: "Process documents in your queue",
    },
    {
      id: "reports",
      label: "View Reports",
      icon: <BarChart className="h-5 w-5" />,
      href: "/dashboard/reports",
      color: "text-purple-500",
      description: "View your financial reports",
    },
    {
      id: "search",
      label: "Search Documents",
      icon: <Search className="h-5 w-5" />,
      href: "/dashboard/search",
      color: "text-amber-500",
      description: "Search through your processed documents",
    },
  ]

  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <TooltipProvider delayDuration={300}>
          {quickActions.map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Link
                  href={action.href}
                  className="block"
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <Button
                    variant="outline"
                    className={`h-16 w-full min-w-[120px] flex flex-col items-center justify-center gap-1 transition-all duration-300 group ${
                      hoveredAction === action.id ? "bg-primary/5 border-primary/30" : ""
                    }`}
                  >
                    <div
                      className={`${action.color || "text-primary"} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium mt-1">{action.label}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{action.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <span>All Actions</span>
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
