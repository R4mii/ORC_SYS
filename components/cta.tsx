import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <div className="bg-gradient-to-r from-finance-primary to-finance-accent">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to streamline your financial processes?
          <br />
          <span className="text-finance-light font-normal">Get started with ORCSYS today.</span>
        </h2>
        <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
          <Button asChild size="lg" className="bg-white text-finance-primary hover:bg-finance-light button-hover">
            <Link href="/auth/register">Get Started</Link>
          </Button>
          <Button asChild variant="link" className="text-white">
            <Link href="/contact" className="flex items-center gap-2">
              Contact Sales <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
