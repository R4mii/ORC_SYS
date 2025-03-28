import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Contact us today to discuss how our solutions can help you achieve your business goals.
        </p>
        <Link href="/contact">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            Get in Touch
          </Button>
        </Link>
      </div>
    </section>
  )
}

