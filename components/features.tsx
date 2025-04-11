import { CheckCircle } from "lucide-react"

const features = [
  "Cutting-edge technology solutions",
  "Expert team with industry experience",
  "Tailored approach for each client",
  "Ongoing support and maintenance",
  "Transparent communication",
  "Agile development methodology",
]

export default function Features() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <div className="w-full md:w-1/2 mb-12 md:mb-0">
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="Business team working together"
              className="rounded-lg shadow-xl"
            />
          </div>

          <div className="w-full md:w-1/2 md:pl-12">
            <h2 className="text-3xl font-bold mb-6">Why Choose Experio?</h2>
            <p className="text-gray-600 mb-8">
              We combine technical expertise with business acumen to deliver solutions that drive real results. Our
              approach is focused on understanding your unique challenges and creating custom strategies that help you
              achieve your goals.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
                  <p>{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
