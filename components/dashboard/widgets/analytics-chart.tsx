"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for chart data
interface ProcessingData {
  date: string
  documents: number
  successRate: number
  avgTime: number
}

interface DocumentTypeData {
  name: string
  value: number
  color: string
}

interface TimeAnalyticsData {
  timeRange: string
  invoices: number
  receipts: number
  statements: number
  other: number
}

export function AnalyticsChartWidget() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("week")
  const [chartTab, setChartTab] = useState("trends")

  // Sample data for processing trends
  const processingTrends: ProcessingData[] = [
    { date: "Mon", documents: 12, successRate: 92, avgTime: 34 },
    { date: "Tue", documents: 19, successRate: 96, avgTime: 28 },
    { date: "Wed", documents: 8, successRate: 88, avgTime: 42 },
    { date: "Thu", documents: 23, successRate: 95, avgTime: 30 },
    { date: "Fri", documents: 17, successRate: 94, avgTime: 32 },
    { date: "Sat", documents: 5, successRate: 90, avgTime: 38 },
    { date: "Sun", documents: 3, successRate: 93, avgTime: 35 },
  ]

  // Sample data for document types
  const documentTypeData: DocumentTypeData[] = [
    { name: "Invoices", value: 45, color: "#4f46e5" },
    { name: "Receipts", value: 28, color: "#10b981" },
    { name: "Statements", value: 17, color: "#f59e0b" },
    { name: "Images", value: 7, color: "#ef4444" },
    { name: "Other", value: 3, color: "#6b7280" },
  ]

  // Sample data for time analytics
  const timeAnalyticsData: TimeAnalyticsData[] = [
    { timeRange: "Morning", invoices: 15, receipts: 8, statements: 5, other: 3 },
    { timeRange: "Afternoon", invoices: 22, receipts: 12, statements: 8, other: 4 },
    { timeRange: "Evening", invoices: 8, receipts: 6, statements: 4, other: 2 },
    { timeRange: "Night", invoices: 2, receipts: 2, statements: 0, other: 1 },
  ]

  // Get proper dataset based on time range
  const getDataForTimeRange = (range: string) => {
    // In a real app, this would fetch different datasets based on the selected time range
    return processingTrends
  }

  // Custom tooltip styles
  const customTooltipStyle = {
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "8px 12px",
    boxShadow: "var(--shadow)",
    fontSize: "12px",
  }

  // Custom tooltip formatter for line charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#6b7280]"></div>
            <span className="text-muted-foreground">Other: 3</span>
          </div>
          className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name}: {entry.value} {entry.unit || ""}
          </span>
        </div>
      )
      )
    }
    </div>
      )
  }
  return null
}

return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">OCR Document Analytics</div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="trends" className="w-full" onValueChange={setChartTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="text-xs">
            Trends
          </TabsTrigger>
          <TabsTrigger value="success" className="text-xs">
            Success Rate
          </TabsTrigger>
          <TabsTrigger value="types" className="text-xs">
            Document Types
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs">
            Processing Time
          </TabsTrigger>
        </TabsList>

        {/* Trends Chart */}
        <TabsContent value="trends" className="pt-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDataForTimeRange(timeRange)}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  width={30}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar 
                  name="Documents Processed" 
                  dataKey="documents" 
                  fill="var(--primary)" 
                  barSize={20}
                  radius={[4, 4, 0, 0]}
                  unit=""
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Success Rate Chart */}
        <TabsContent value="success" className="pt-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getDataForTimeRange(timeRange)}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  width={30}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  name="Success Rate" 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="var(--primary)" 
                  fill="url(#successGradient)" 
                  unit="%"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Document Types Chart */}
        <TabsContent value="types" className="pt-4">
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {documentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend 
                  iconType="circle" 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value, entry, index) => (
                    <span style={{ color: 'var(--foreground)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Processing Time Chart */}
        <TabsContent value="time" className="pt-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeAnalyticsData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="timeRange" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  width={30}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  formatter={(value, entry, index) => (
                    <span style={{ color: 'var(--foreground)' }}>{value}</span>
                  )}
                />
                <Bar name="Invoices" stackId="a" dataKey="invoices" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar name="Receipts" stackId="a" dataKey="receipts" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Statements" stackId="a" dataKey="statements" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar name="Other" stackId="a" dataKey="other" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      {chartTab === "trends" && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Total Documents: 87</span>
          <span>Daily Average: 12.4</span>
        </div>
      )}
      
      {chartTab === "success" && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Average Success Rate: 92.6%</span>
          <span>Failed Documents: 7</span>
        </div>
      )}
      
      {chartTab === "types" && (
        <div className="grid grid-cols-5 gap-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#4f46e5]"></div>
            <span className="text-muted-foreground">Invoices: 45</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
            <span className="text-muted-foreground">Receipts: 28</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
            <span className="text-muted-foreground">Statements: 17</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
            <span className="text-muted-foreground">Images: 7</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#6b7280]"></div>
            <span className="text-muted-foreground">Other: 3</span>
          </div
