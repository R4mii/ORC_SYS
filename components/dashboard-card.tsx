"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      border: "border-t-blue-500",
      header: "bg-blue-500",
      button: "bg-white text-blue-500 hover:bg-blue-50",
    },
    green: {
      border: "border-t-green-500",
      header: "bg-green-500",
      button: "bg-white text-green-500 hover:bg-green-50",
    },
    amber: {
      border: "border-t-amber-500",
      header: "bg-amber-500",
      button: "bg-white text-amber-500 hover:bg-amber-50",
    },
    red: {
      border: "border-t-red-500",
      header: "bg-red-500",
      button: "bg-white text-red-500 hover:bg-red-50",
    },
    purple: {
      border: "border-t-purple-500",
      header: "bg-purple-500",
      button: "bg-white text-purple-500 hover:bg-purple-50",
    },
  }

  return (
    <Card className={`overflow-hidden border-t-4 ${colorClasses[color].border} animate-fade-in`}>
      <CardHeader className={`${colorClasses[color].header} text-white p-4 pb-2`}>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <span>{title}</span>
          </div>
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="secondary"
              className={`h-8 text-xs ${colorClasses[color].button}`}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-3">{children}</CardContent>
    </Card>
  )
}

