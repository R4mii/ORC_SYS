import type React from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, PieChart, TrendingUp, LineChart, Layers, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportingSolutionPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Financial Reporting
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Data-Driven Financial Insights</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Generate comprehensive reports with real-time data to make informed business decisions and drive growth.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-full h-full min-h-[300px]">
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="Financial Reporting Dashboard"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Powerful Reporting Features</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Gain valuable insights into your financial performance with our comprehensive reporting tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-primary" />}
            title="Financial Statements"
            description="Generate income statements, balance sheets, and cash flow statements with a single click"
          />
          <FeatureCard
            icon={<PieChart className="h-10 w-10 text-primary" />}
            title="Expense Analysis"
            description="Break down expenses by category to identify cost-saving opportunities"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-primary" />}
            title="Revenue Forecasting"
            description="Predict future revenue based on historical data and trends"
          />
          <FeatureCard
            icon={<LineChart className="h-10 w-10 text-primary" />}
            title="Performance Tracking"
            description="Monitor key financial metrics and KPIs in real-time dashboards"
          />
          <FeatureCard
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Custom Reports"
            description="Create tailored reports to meet your specific business requirements"
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-primary" />}
            title="Shareable Insights"
            description="Easily share reports with stakeholders and team members"
          />
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Our reporting solution simplifies financial analysis in three easy steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="01"
            title="Connect Your Data"
            description="Import your financial data from various sources or use our platform for all your accounting needs"
          />
          <StepCard
            number="02"
            title="Select Your Reports"
            description="Choose from our library of pre-built reports or create custom ones tailored to your needs"
          />
          <StepCard
            number="03"
            title="Analyze & Act"
            description="Gain insights from visual dashboards and make data-driven decisions to grow your business"
          />
        </div>
      </div>

      <div className="mt-20 bg-muted rounded-lg p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your financial reporting?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to gain valuable financial insights.
          </p>
          <Link href="/auth/register">
            <Button size="lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center text-center h-full">
      <CardHeader>
        <div className="p-2 bg-primary/10 rounded-full mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-none bg-background shadow-md">
      <div className="absolute -top-6 -left-6 text-8xl font-bold text-primary/10">{number}</div>
      <CardHeader className="pt-8">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
