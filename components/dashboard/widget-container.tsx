"use client"

import type React from "react"

import { useState } from "react"
import { ArrowUpDown, Grip, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WidgetContainerProps {
  children: React.ReactNode
  title: string
  description?: string
  onRemove?: () => void
  onResize?: (size: "sm" | "md" | "lg") => void
  defaultSize?: "sm" | "md" | "lg"
  isDraggable?: boolean
  id: string
}

export function WidgetContainer({
  children,
  title,
  description,
  onRemove,
  onResize,
  defaultSize = "md",
  isDraggable = true,
  id,
}: WidgetContainerProps) {
  const [size, setSize] = useState<"sm" | "md" | "lg">(defaultSize)
  const [isDragging, setIsDragging] = useState(false)

  // Size class mapping
  const sizeClasses = {
    sm: "col-span-1",
    md: "col-span-2",
    lg: "col-span-3",
  }

  // Handle resize
  const handleResize = () => {
    const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"]
    const currentIndex = sizes.indexOf(size)
    const nextSize = sizes[(currentIndex + 1) % sizes.length]
    setSize(nextSize)

    if (onResize) {
      onResize(nextSize)
    }
  }

  return (
    <Card className={`${sizeClasses[size]} shadow-sm transition-all duration-300 hover:shadow-md`}>
      <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
        {isDraggable && (
          <Grip
            className="h-4 w-4 text-muted-foreground cursor-move"
            data-drag-handle
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
        )}
        <CardTitle className="text-sm font-medium flex-grow">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          {onResize && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleResize} title="Resize widget">
              <ArrowUpDown className="h-3 w-3" />
              <span className="sr-only">Resize</span>
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
              onClick={onRemove}
              title="Remove widget"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )
}
