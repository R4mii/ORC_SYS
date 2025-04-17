"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NotificationIndicatorProps {
  count: number
}

export function NotificationIndicator({ count }: NotificationIndicatorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">Notifications</h4>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {count === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {/* Sample notifications - in a real app, these would come from your state */}
              <NotificationItem
                title="OCR Processing Failed"
                description="The invoice from Supplier XYZ could not be processed."
                time="2 minutes ago"
                unread
              />
              <NotificationItem
                title="Low Balance Alert"
                description="Your account balance is below 5,000 DH."
                time="1 hour ago"
                unread
              />
              <NotificationItem
                title="VAT Declaration Due"
                description="Your quarterly VAT declaration is due in 5 days."
                time="3 hours ago"
              />
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface NotificationItemProps {
  title: string
  description: string
  time: string
  unread?: boolean
}

function NotificationItem({ title, description, time, unread }: NotificationItemProps) {
  return (
    <div
      className={cn("flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted", unread && "bg-muted/50")}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h5 className={cn("text-sm", unread && "font-medium")}>{title}</h5>
          {unread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground/70">{time}</p>
      </div>
    </div>
  )
}
