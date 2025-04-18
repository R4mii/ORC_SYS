import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Hero() {
  const features = [
    "Advanced OCR Technology",
    "Automated Invoice Processing",
    "Real-time Financial Insights",
    "Secure Cloud Storage",
  ]

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-finance-light to-white dark:from-finance-dark dark:to-background">
      <div className="absolute inset-0 bg-[url(/placeholder.svg?height=500&width=500)] bg-center [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:bg-[url(/placeholder.svg?height=500&width=500&darkMode=true)] opacity-20"></div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="gradient-heading">Streamline your financial workflows</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              ORCSYS helps businesses automate financial processes with cutting-edge OCR technology. Transform document
              management and gain powerful insights.
            </p>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-finance-accent" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-finance-primary hover:bg-finance-accent text-white button-hover">
                <Link href="/dashboard/upload">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-finance-primary text-finance-primary hover:bg-finance-light dark:hover:bg-finance-dark button-hover"
              >
                <Link href="/services" className="flex items-center gap-2">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-finance-primary to-finance-accent blur opacity-75"></div>
              <div className="card-shadow relative overflow-hidden rounded-xl border border-border bg-card">
                <img src="/placeholder.svg?height=500&width=700" alt="Dashboard preview" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
