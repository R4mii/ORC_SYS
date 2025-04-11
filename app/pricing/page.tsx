import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Pricing</div>
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl/tight">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Choose the plan that works best for your business needs
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
        <PricingCard
          title="Starter"
          price="299 MAD"
          description="Perfect for small businesses just getting started"
          features={[
            "Basic invoicing",
            "Financial reporting",
            "Document storage (5GB)",
            "Email support",
            "Up to 100 invoices/month",
          ]}
          buttonText="Get Started"
        />
        <PricingCard
          title="Professional"
          price="799 MAD"
          description="Ideal for growing businesses with more complex needs"
          features={[
            "Advanced invoicing",
            "Comprehensive reporting",
            "Tax management",
            "Priority support",
            "Team collaboration (5 users)",
            "Document storage (20GB)",
            "Up to 500 invoices/month",
          ]}
          buttonText="Get Started"
          highlighted={true}
        />
        <PricingCard
          title="Enterprise"
          price="1499 MAD"
          description="For established businesses with advanced requirements"
          features={[
            "Custom invoicing",
            "Advanced analytics",
            "API access",
            "Dedicated account manager",
            "Custom integrations",
            "Training sessions",
            "Unlimited users",
            "Document storage (100GB)",
            "Unlimited invoices",
          ]}
          buttonText="Contact Sales"
        />
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          We offer tailored solutions for businesses with specific requirements. Contact our sales team to discuss your
          needs.
        </p>
        <Link href="/contact">
          <Button size="lg">
            Contact Sales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
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
      <CardFooter className="pt-0">
        <Link href="/auth/register" className="w-full">
          <Button className="w-full" variant={highlighted ? "default" : "outline"}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
