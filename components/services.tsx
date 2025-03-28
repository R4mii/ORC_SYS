import { ArrowRight, Code, BarChart3, Lightbulb } from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: "Digital Transformation",
    description:
      "Enhance your business with modern digital solutions that streamline operations and improve customer experience.",
    link: "/services/digital-transformation",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Custom Software",
    description:
      "We build tailored software solutions designed specifically for your unique business needs and challenges.",
    link: "/services/custom-software",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: "Strategic Consulting",
    description:
      "Expert advice and guidance to help you navigate the complex digital landscape and make informed decisions.",
    link: "/services/consulting",
  },
]

export default function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive solutions to help your business thrive in the digital age
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="mb-5">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-5">{service.description}</p>
              <Link href={service.link} className="inline-flex items-center text-primary font-medium hover:underline">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

