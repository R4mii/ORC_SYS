import type React from "react"
import Link from "next/link"
import { ArrowRight, FileCheck, Calendar, Shield, Clock, RefreshCw, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TaxSolutionPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Tax Management
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simplify Tax Compliance</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Streamline tax preparation, ensure compliance, and maximize deductions with our comprehensive tax
              management solution.
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
              alt="Tax Management Dashboard"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Key Tax Management Features</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Our comprehensive tax solution helps businesses stay compliant and minimize tax burden
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FileCheck className="h-10 w-10 text-primary" />}
            title="Automated Tax Calculations"
            description="Automatically calculate VAT, income tax, and other tax obligations based on your financial data"
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-primary" />}
            title="Tax Calendar"
            description="Never miss a deadline with our tax calendar and automated reminders for filing and payment dates"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-primary" />}
            title="Compliance Checks"
            description="Built-in validation ensures your tax filings meet all regulatory requirements"
          />
          <FeatureCard
            icon={<Clock className="h-10 w-10 text-primary" />}
            title="Real-time Tax Tracking"
            description="Monitor your tax obligations in real-time throughout the fiscal year"
          />
          <FeatureCard
            icon={<RefreshCw className="h-10 w-10 text-primary" />}
            title="Tax Optimization"
            description="Identify tax-saving opportunities and optimize your tax strategy"
          />
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-primary" />}
            title="Digital Record Keeping"
            description="Maintain digital records of all tax-related documents for easy access during audits"
          />
        </div>
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Tax Solutions for Every Business</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Whether you're a small business or a large enterprise, our tax management solution adapts to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Small Business</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Simplified VAT calculations and reporting</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Basic tax calendar with reminders</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Digital storage for tax documents</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Standard tax reports</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full border-primary shadow-lg">
            <CardHeader>
              <CardTitle>Medium Business</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced tax calculations for multiple tax types</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Comprehensive tax calendar with workflow</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tax optimization recommendations</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Custom tax reports and analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Complex tax calculations for international operations</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Multi-entity tax management</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced tax planning and scenario modeling</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>Integration with ERP systems</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-20 bg-muted rounded-lg p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to simplify your tax management?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to streamline their tax compliance.
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

