import Link from "next/link"
import { ArrowRight, Code, BarChart3, Lightbulb, Database, Globe, Shield, Smartphone, Zap, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  {
    icon: <Database className="h-10 w-10 text-primary" />,
    title: "Data Analytics",
    description:
      "Transform your raw data into actionable insights that drive business growth and competitive advantage.",
    link: "/services/data-analytics",
  },
  {
    icon: <Globe className="h-10 w-10 text-primary" />,
    title: "Web Development",
    description: "Create stunning, responsive websites that engage visitors and convert them into customers.",
    link: "/services/web-development",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "Cybersecurity",
    description: "Protect your business from threats with comprehensive security solutions and best practices.",
    link: "/services/cybersecurity",
  },
  {
    icon: <Smartphone className="h-10 w-10 text-primary" />,
    title: "Mobile App Development",
    description: "Build native and cross-platform mobile applications that deliver exceptional user experiences.",
    link: "/services/mobile-development",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Cloud Solutions",
    description:
      "Leverage the power of cloud computing to increase scalability, reduce costs, and improve collaboration.",
    link: "/services/cloud-solutions",
  },
  {
    icon: <Layers className="h-10 w-10 text-primary" />,
    title: "UI/UX Design",
    description: "Create intuitive, engaging user interfaces that enhance user satisfaction and business outcomes.",
    link: "/services/ui-ux-design",
  },
]

export default function Services() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-600">
              We provide comprehensive digital solutions to help your business thrive in today's competitive landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
              >
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

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We follow a proven methodology to ensure successful outcomes for every project
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Process steps */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>

              {/* Step 1 */}
              <div className="relative mb-12">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8">
                    <h3 className="text-xl font-bold mb-2">Discovery</h3>
                    <p className="text-gray-600">
                      We begin by understanding your business, goals, and challenges through in-depth discussions.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold my-4 md:my-0 z-10">
                    1
                  </div>
                  <div className="flex-1 md:pl-8">
                    <div className="bg-white p-4 rounded-lg shadow-md md:mt-0">
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Stakeholder interviews</li>
                        <li>Business analysis</li>
                        <li>Requirements gathering</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative mb-12">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 md:order-1">
                    <div className="bg-white p-4 rounded-lg shadow-md md:mt-0">
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Solution architecture</li>
                        <li>Technology selection</li>
                        <li>Project planning</li>
                      </ul>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold my-4 md:my-0 z-10">
                    2
                  </div>
                  <div className="flex-1 md:pl-8 md:order-3">
                    <h3 className="text-xl font-bold mb-2">Strategy</h3>
                    <p className="text-gray-600">
                      We develop a comprehensive strategy and roadmap tailored to your specific needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative mb-12">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8">
                    <h3 className="text-xl font-bold mb-2">Implementation</h3>
                    <p className="text-gray-600">
                      Our expert team brings the strategy to life using agile methodologies.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold my-4 md:my-0 z-10">
                    3
                  </div>
                  <div className="flex-1 md:pl-8">
                    <div className="bg-white p-4 rounded-lg shadow-md md:mt-0">
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Agile development</li>
                        <li>Regular progress updates</li>
                        <li>Quality assurance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 md:order-1">
                    <div className="bg-white p-4 rounded-lg shadow-md md:mt-0">
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Training and knowledge transfer</li>
                        <li>Ongoing support</li>
                        <li>Continuous improvement</li>
                      </ul>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold my-4 md:my-0 z-10">
                    4
                  </div>
                  <div className="flex-1 md:pl-8 md:order-3">
                    <h3 className="text-xl font-bold mb-2">Support & Growth</h3>
                    <p className="text-gray-600">
                      We provide ongoing support and help you evolve your solution as your business grows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Contact us today to discuss how our services can help you achieve your business goals.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

