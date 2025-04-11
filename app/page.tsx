import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, BarChart3, FileText, Upload, PieChart, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Modern Accounting Solutions for Growing Businesses
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Streamline your financial operations with our intuitive platform. Save time, reduce errors, and gain
                  valuable insights.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg transform rotate-2"></div>
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="Dashboard Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl transform -rotate-1 transition-all duration-200 hover:rotate-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">Trusted by Businesses Worldwide</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Join thousands of companies using our platform to streamline their accounting processes
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
              {["Company A", "Company B", "Company C", "Company D", "Company E"].map((company) => (
                <div key={company} className="flex items-center justify-center">
                  <div className="text-2xl font-bold text-muted-foreground/60">{company}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need in One Place
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Our comprehensive platform provides all the tools you need to manage your finances efficiently
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="Invoicing"
              description="Create and manage professional invoices with automated reminders and payment tracking"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Financial Reporting"
              description="Generate comprehensive reports with real-time data to make informed business decisions"
            />
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-primary" />}
              title="Document Management"
              description="Upload and organize all your financial documents in one secure location"
            />
            <FeatureCard
              icon={<PieChart className="h-10 w-10 text-primary" />}
              title="Tax Management"
              description="Simplify tax preparation with automated calculations and compliance checks"
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Secure Data"
              description="Bank-level security ensures your financial information is always protected"
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-primary" />}
              title="Time-Saving Automation"
              description="Automate repetitive tasks to focus on what matters most for your business"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Simple Process, Powerful Results
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Get started in minutes and transform your financial management
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
            <StepCard
              number="01"
              title="Sign Up"
              description="Create your account in minutes with our simple onboarding process"
            />
            <StepCard
              number="02"
              title="Connect Your Data"
              description="Import your existing financial data or start fresh with our intuitive platform"
            />
            <StepCard
              number="03"
              title="Start Managing"
              description="Use our powerful tools to streamline your accounting processes"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What Our Clients Say</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Hear from businesses that have transformed their financial operations with our platform
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="Experio has completely transformed how we manage our finances. The time savings alone have been worth the investment."
              author="Sarah Johnson"
              position="CFO, TechStart Inc."
            />
            <TestimonialCard
              quote="The reporting features give us insights we never had before. We can make better business decisions with real-time data."
              author="Michael Chen"
              position="CEO, GrowthWave"
            />
            <TestimonialCard
              quote="The customer support team is exceptional. They've helped us customize the platform to fit our unique business needs."
              author="Emma Rodriguez"
              position="Finance Director, Innovate Ltd"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Choose the plan that works best for your business needs
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <PricingCard
              title="Starter"
              price="$29"
              description="Perfect for small businesses just getting started"
              features={["Basic invoicing", "Financial reporting", "Document storage", "Email support"]}
              buttonText="Get Started"
            />
            <PricingCard
              title="Professional"
              price="$79"
              description="Ideal for growing businesses with more complex needs"
              features={[
                "Advanced invoicing",
                "Comprehensive reporting",
                "Tax management",
                "Priority support",
                "Team collaboration",
              ]}
              buttonText="Get Started"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="$149"
              description="For established businesses with advanced requirements"
              features={[
                "Custom invoicing",
                "Advanced analytics",
                "API access",
                "Dedicated account manager",
                "Custom integrations",
                "Training sessions",
              ]}
              buttonText="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Financial Management?
              </h2>
              <p className="max-w-[700px] md:text-xl">
                Join thousands of businesses already using our platform to streamline their accounting processes
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground px-8">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
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

function TestimonialCard({ quote, author, position }: { quote: string; author: string; position: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-primary"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <p className="italic text-muted-foreground mb-4">"{quote}"</p>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{position}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  highlighted = false,
}: {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  highlighted?: boolean
}) {
  return (
    <Card className={`flex flex-col h-full ${highlighted ? "border-primary shadow-lg relative" : ""}`}>
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-6 pt-0 mt-auto">
        <Link href="/auth/register">
          <Button className="w-full" variant={highlighted ? "default" : "outline"}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
