import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Star } from "lucide-react"
import CTA from "@/components/cta"
import Features from "@/components/features"
import Hero from "@/components/hero"
import Testimonials from "@/components/testimonials"

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center text-center h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-muted">
      <CardHeader>
        <div className="p-3 bg-primary/10 rounded-full mb-4 w-16 h-16 flex items-center justify-center">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden border-none bg-background shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="absolute -top-6 -left-6 text-8xl font-bold text-primary/10">{number}</div>
      <CardHeader className="pt-8">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, author, position }: { quote: string; author: string; position: string }) {
  return (
    <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-muted">
      <CardHeader>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-5 w-5 fill-current text-primary" />
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
    <Card
      className={`flex flex-col h-full transition-all duration-200 hover:-translate-y-1 ${highlighted ? "border-primary shadow-lg relative" : "border-muted hover:shadow-md"}`}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
          Le plus populaire
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/mois</span>
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
