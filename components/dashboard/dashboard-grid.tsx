"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardGridProps {
  children: React.ReactNode;
  onAddWidget?: () => void;
  availableWidgets?: Array<{
    id: string;
    title: string;
    description: string;
    component: React.ReactNode;
  }>;
}

export function DashboardGrid({ 
  children, 
  onAddWidget,
  availableWidgets = []
}: DashboardGridProps) {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  const handleAddWidget = (widgetId: string) => {
    if (onAddWidget) {
      onAddWidget();
    }
    setIsAddWidgetOpen(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
                <DialogDescription>
                  Select a widget to add to your dashboard
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[300px] mt-4 pr-4">
                <div className="space-y-3">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="rounded-lg border p-3 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleAddWidget(widget.id)}
                    >
                      <h4 className="font-medium">{widget.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {children}
        </div>
      </div>
    </DndProvider>
  );
}

