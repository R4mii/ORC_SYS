import type React from "react"
import Link from "next/link"
import { ArrowRight, FileText, Clock, CreditCard, BarChart, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InvoicingSolutionPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Invoicing Solution
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Streamline Your Billing Process</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Create professional invoices, automate reminders, and get paid faster with our comprehensive invoicing
              solution.
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
              alt="Invoicing Dashboard"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Everything you need to manage your invoicing process efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-primary" />}
            title="Professional Invoices"
            description="Create customizable, professional invoices with your branding in minutes"
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-primary" />}
            title="Automated Reminders"
            description="Set up automatic payment reminders to reduce late payments"
          />
          <FeatureCard
            icon={<CreditCard className="h-10 w-10 text-primary" />}
            title="Multiple Payment Options"
            description="Accept payments through various methods including credit cards and bank transfers"
          />
          <FeatureCard
            icon={<BarChart className="h-10 w-10 text-primary" />}
            title="Real-time Tracking"
            description="Monitor payment status and get insights into your cash flow"
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-primary" />}
            title="Tax Compliance"
            description="Automatically calculate taxes based on your location and requirements"
          />
          <FeatureCard
            icon={<ArrowRight className="h-10 w-10 text-primary" />}
            title="Seamless Integration"
            description="Connect with your accounting software for streamlined financial management"
          />
        </div>
      </div>

      <div className="mt-20 bg-muted rounded-lg p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your invoicing process?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of businesses already using our platform to streamline their invoicing and get paid faster.
            </p>
            <Link href="/auth/register">
              <Button size="lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md">
              <div className="text-xl font-bold mb-2">What our clients say</div>
              <p className="italic mb-4">
                "Experio's invoicing solution has cut our billing time by 75% and improved our cash flow significantly.
                The automated reminders alone have been worth the investment."
              </p>
              <div className="font-medium">Sarah Johnson</div>
              <div className="text-sm text-muted-foreground">CFO, TechStart Inc.</div>
            </div>
          </div>
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

