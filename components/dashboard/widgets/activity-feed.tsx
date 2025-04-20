"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { FileText, CheckCircle, XCircle, Clock, MoreHorizontal, EyeIcon, DownloadIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type ActivityStatus = "success" | "pending" | "error"

interface ActivityItem {
  id: string
  documentName: string
  documentType: string
  timestamp: Date
  status: ActivityStatus
  user: {
    name: string
    avatar?: string
    initials: string
  }
  action: string
}

export function ActivityFeedWidget() {
  const [filter, setFilter] = useState<ActivityStatus | "all">("all")

  // Dummy data for activity items
  const activityItems: ActivityItem[] = [
    {
      id: "act-1",
      documentName: "Invoice-2023-04-15.pdf",
      documentType: "Invoice",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      status: "success",
      user: {
        name: "Alex Johnson",
        initials: "AJ",
      },
      action: "processed",
    },
    {
      id: "act-2",
      documentName: "Expenses-Q1.xlsx",
      documentType: "Expense Report",
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: "pending",
      user: {
        name: "Maria Garcia",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MG",
      },
      action: "uploaded",
    },
    {
      id: "act-3",
      documentName: "Contract-2023-121.pdf",
      documentType: "Contract",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "error",
      user: {
        name: "David Kim",
        initials: "DK",
      },
      action: "processed",
    },
    {
      id: "act-4",
      documentName: "Receipt-Shopping.jpg",
      documentType: "Receipt",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: "success",
      user: {
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SW",
      },
      action: "processed",
    },
    {
      id: "act-5",
      documentName: "Bank-Statement-March.pdf",
      documentType: "Bank Statement",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: "success",
      user: {
        name: "Thomas Brown",
        initials: "TB",
      },
      action: "uploaded",
    },
  ]

  // Filter activities based on the selected filter
  const filteredActivities = activityItems.filter((item) => {
    if (filter === "all") return true
    return item.status === filter
  })

  // Status badge color mapping
  const statusConfig = {
    success: {
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: <Clock className="h-3.5 w-3.5 text-yellow-500" />,
    },
    error: {
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    },
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-7"
          >
            All
          </Button>
          <Button
            variant={filter === "success" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("success")}
            className="text-xs h-7"
          >
            Success
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className="text-xs h-7"
          >
            Pending
          </Button>
          <Button
            variant={filter === "error" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("error")}
            className="text-xs h-7"
          >
            Error
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                    <AvatarFallback>{item.user.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium truncate">{item.documentName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-normal">
                          {item.documentType}
                        </Badge>
                        <Badge className={`text-xs flex items-center gap-1 ${statusConfig[item.status].color}`}>
                          {statusConfig[item.status].icon}
                          <span className="capitalize">{item.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <TooltipProvider>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Actions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2">
                            <EyeIcon className="h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" /> Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {item.user.name} {item.action} this
                    </span>
                    <span>•</span>
                    <time dateTime={item.timestamp.toISOString()}>
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No activities found</p>
              <p className="text-xs text-muted-foreground mt-1">Try changing the filter or check back later</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
