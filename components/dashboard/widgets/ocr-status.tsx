"use client";

import { useState, useEffect } from "react";
import {
  PauseCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProcessingTask {
  id: string;
  fileName: string;
  fileType: string;
  progress: number;
  status: "processing" | "queued" | "completed" | "error";
  timeRemaining?: number; // in seconds
  startTime: Date;
  errorMessage?: string;
}

export function OcrStatusWidget() {
  const [processingPaused, setProcessingPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  // Dummy data for processing tasks
  const [tasks, setTasks] = useState<ProcessingTask[]>([
    {
      id: "task-1",
      fileName: "invoice-april.pdf",
      fileType: "PDF",
      progress: 67,
      status: "processing",
      timeRemaining: 45,
      startTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    },
    {
      id: "task-2",
      fileName: "receipt-12345.jpg",
      fileType: "Image",
      progress: 32,
      status: "processing",
      timeRemaining: 78,
      startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: "task-3",
      fileName: "expenses-q1.pdf",
      fileType: "PDF",
      progress: 0,
      status: "queued",
      startTime: new Date(),
    },
    {
      id: "task-4",
      fileName: "contract-renewal.pdf",
      fileType: "PDF",
      progress: 0,
      status: "queued",
      startTime: new Date(),
    },
    {
      id: "task-5",
      fileName: "scan-document.png",
      fileType: "Image",
      progress: 100,
      status: "completed",
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "task-6",
      fileName: "damaged-receipt.jpg",
      fileType: "Image",
      progress: 45,
      status: "error",
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      errorMessage: "Low quality image, text extraction failed",
    },
  ]);

  // Stats for today
  const stats = {
    processed: 28,
    queued: 3,
    active: 2,
    errors: 1,
    success_rate: 96, // percentage
    avg_processing_time: 42, // seconds
  };

  // Simulate progress updates
  useEffect(() => {
    if (processingPaused) return;

    const timer = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status !== "processing") return task;
          
          const newProgress = Math.min(task.progress + 1, 100);
          const newTimeRemaining = task.timeRemaining ? Math.max(task.timeRemaining - 1, 0) : 0;
          
          // If task completes
          if (newProgress === 100) {
            return {
              ...task,
              progress: 100,
              status: "completed",
              timeRemaining: 0,
            };
          }
          
          return {
            ...task,
            progress: newProgress,
            timeRemaining: newTimeRemaining,
          };
        })
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, [processingPaused]);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "active") return task.status === "processing" || task.status === "queued";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "errors") return task.status === "error";
    return true;
  });

  const toggleProcessing = () => {
    setProcessingPaused(!processingPaused);
  };

  // Format time remaining
  const formatTime = (seconds?: number): string => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.processed}</div>
          <div className="text-xs text-muted-foreground">Processed</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.queued}</div>
          <div className="text-xs text-muted-foreground">Queued</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.errors}</div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </div>
      </div>

      {/* Success Rate Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Success Rate</div>
          <div className="text-sm">{stats.success_rate}%</div>
        </div>
        <Progress value={stats.success_rate} className="h-2" />
      </div>

      {/* Processing Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={`
              flex items-center gap-1 
              ${processingPaused ? 'text-yellow-500' : 'text-green-500'}
            `}
          >
            {processingPaused ? (
              <>
                <PauseCircle className="h-3 w-3" />
                <span>Paused</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-3 w-3" />
                <span>Processing</span>
              </>
            )}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Avg. Time: {stats.avg_processing_time}s
          </span>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={toggleProcessing}
                >
                  {processingPaused ? (
                    <PlayCircle className="h-4 w-4" />
                  ) : (
                    <PauseCircle className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{processingPaused ? 'Resume Processing' : 'Pause Processing'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Task List */}
      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="text-xs">Active & Queued</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">Errors</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-2 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              No tasks found
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate">{task.fileName}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {task.fileType}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    {task.status === "processing" && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Processing
                      </Badge>
                    )}
                    {task.status === "queued" && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Queued
                      </Badge>
                    )}
                    {task.status === "completed" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </Badge>
                    )}
                    {task.status === "error" && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar for processing tasks */}
                {task.status === "processing" && (
                  <div className="space-y-1">
                    <Progress value={task.progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>{task.progress}% complete</div>
                      <div>Est. {formatTime(task.timeRemaining)} remaining</div>
                    </div>
                  </div>
                )}
                
                {/* Display error message */}
                {task.status === "error" && task.errorMessage && (
                  <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{task.errorMessage}</span>
                  </div>
                )}
                
                {/* Task controls */}
                {(task.status === "processing" || task.status === "queued") && (
                  <div className="mt-2 flex justify-end gap-1">
                    {task.status === "processing" && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  PauseCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProcessingTask {
  id: string;
  fileName: string;
  fileType: string;
  progress: number;
  status: "processing" | "queued" | "completed" | "error";
  timeRemaining?: number; // in seconds
  startTime: Date;
  errorMessage?: string;
}

export function OcrStatusWidget() {
  const [processingPaused, setProcessingPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  // Dummy data for processing tasks
  const [tasks, setTasks] = useState<ProcessingTask[]>([
    {
      id: "task-1",
      fileName: "invoice-april.pdf",
      fileType: "PDF",
      progress: 67,
      status: "processing",
      timeRemaining: 45,
      startTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    },
    {
      id: "task-2",
      fileName: "receipt-12345.jpg",
      fileType: "Image",
      progress: 32,
      status: "processing",
      timeRemaining: 78,
      startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: "task-3",
      fileName: "expenses-q1.pdf",
      fileType: "PDF",
      progress: 0,
      status: "queued",
      startTime: new Date(),
    },
    {
      id: "task-4",
      fileName: "contract-renewal.pdf",
      fileType: "PDF",
      progress: 0,
      status: "queued",
      startTime: new Date(),
    },
    {
      id: "task-5",
      fileName: "scan-document.png",
      fileType: "Image",
      progress: 100,
      status: "completed",
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "task-6",
      fileName: "damaged-receipt.jpg",
      fileType: "Image",
      progress: 45,
      status: "error",
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      errorMessage: "Low quality image, text extraction failed",
    },
  ]);

  // Stats for today
  const stats = {
    processed: 28,
    queued: 3,
    active: 2,
    errors: 1,
    success_rate: 96, // percentage
    avg_processing_time: 42, // seconds
  };

  // Simulate progress updates
  useEffect(() => {
    if (processingPaused) return;

    const timer = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status !== "processing") return task;
          
          const newProgress = Math.min(task.progress + 1, 100);
          const newTimeRemaining = task.timeRemaining ? Math.max(task.timeRemaining - 1, 0) : 0;
          
          // If task completes
          if (newProgress === 100) {
            return {
              ...task,
              progress: 100,
              status: "completed",
              timeRemaining: 0,
            };
          }
          
          return {
            ...task,
            progress: newProgress,
            timeRemaining: newTimeRemaining,
          };
        })
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, [processingPaused]);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "active") return task.status === "processing" || task.status === "queued";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "errors") return task.status === "error";
    return true;
  });

  const toggleProcessing = () => {
    setProcessingPaused(!processingPaused);
  };

  // Format time remaining
  const formatTime = (seconds?: number): string => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.processed}</div>
          <div className="text-xs text-muted-foreground">Processed</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.queued}</div>
          <div className="text-xs text-muted-foreground">Queued</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{stats.errors}</div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </div>
      </div>

      {/* Success Rate Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Success Rate</div>
          <div className="text-sm">{stats.success_rate}%</div>
        </div>
        <Progress value={stats.success_rate} className="h-2" />
      </div>

      {/* Processing Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline" 
            className={`
              flex items-center gap-1 
              ${processingPaused ? 'text-yellow-500' : 'text-green-500'}
            `}
          >
            {processingPaused ? (
              <>
                <PauseCircle className="h-3 w-3" />
                <span>Paused</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-3 w-3" />
                <span>Processing</span>
              </>
            )}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Avg. Time: {stats.avg_processing_time}s
          </span>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={toggleProcessing}
                >
                  {processingPaused ? (
                    <PlayCircle className="h-4 w-4" />
                  ) : (
                    <PauseCircle className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{processingPaused ? 'Resume Processing' : 'Pause Processing'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Task List */}
      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="text-xs">Active & Queued</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">Errors</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-2 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              No tasks found
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate">{task.fileName}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {task.fileType}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    {task.status === "processing" && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Processing
                      </Badge>
                    )}
                    {task.status === "queued" && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Queued
                      </Badge>
                    )}
                    {task.status === "completed" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </Badge>
                    )}
                    {task.status === "error" && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar for processing tasks */}
                {task.status === "processing" && (
                  <div className="space-y-1">
                    <Progress value={task.progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>{task.progress}% complete</div>
                      <div>Est. {formatTime(task.timeRemaining)} remaining</div>
                    </div>
                  </div>
                )}
                
                {/* Display error message */}
                {task.status === "error" && task.errorMessage && (
                  <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{task.errorMessage}</span>
                  </div>
                )}
                
                {/* Task controls */}
                {(task.status === "processing" || task.status === "queued") && (
                  <div className="mt-2 flex justify-end gap-1">
                    {task.status === "processing" && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

