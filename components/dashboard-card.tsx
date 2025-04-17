"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  icon: LucideIcon
  color: "blue" | "green" | "amber" | "red" | "purple"
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}

export function DashboardCard({ title, icon: Icon, color, actionLabel, onAction, children }: DashboardCardProps) {
  // Color mapping
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      button: "bg-white/20 hover:bg-white/30 text-white border-0",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      button: "bg-white/20 hover:bg-white/30 text-white border-0",
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      button: "bg-white/20 hover:bg-white/30 text-white border-0",
    },
    red: {
      gradient: "from-red-500 to-red-600",
      button: "bg-white/20 hover:bg-white/30 text-white border-0",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      button: "bg-white/20 hover:bg-white/30 text-white border-0",
    },
  }

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`bg-gradient-to-r ${colorClasses[color].gradient} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold flex items-center">
            <Icon className="h-5 w-5 mr-2" />
            {title}
          </h3>
          {actionLabel && onAction && (
            <Button size="sm" variant="secondary" className={colorClasses[color].button} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}
