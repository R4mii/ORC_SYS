import { Users, Award, Clock, Globe } from "lucide-react"

const stats = [
  { icon: <Users className="h-6 w-6 text-primary" />, value: "50+", label: "Clients Served" },
  { icon: <Award className="h-6 w-6 text-primary" />, value: "15+", label: "Years Experience" },
  { icon: <Clock className="h-6 w-6 text-primary" />, value: "100+", label: "Projects Completed" },
  { icon: <Globe className="h-6 w-6 text-primary" />, value: "10+", label: "Countries" },
]

const team = [
  {
    name: "John Smith",
    position: "CEO & Founder",
    image: "/placeholder.svg?height=400&width=400",
    bio: "With over 20 years of experience in technology and business consulting, John leads our team with vision and expertise.",
  },
  {
    name: "Sarah Johnson",
    position: "CTO",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Sarah brings deep technical knowledge and innovative thinking to every project, ensuring cutting-edge solutions.",
  },
  {
    name: "Michael Chen",
    position: "Head of Consulting",
    image: "/placeholder.svg?height=400&width=400",
    bio: "Michael's strategic mindset and industry insights help our clients navigate complex business challenges.",
  },
]

export default function About() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About Experio</h1>
            <p className="text-xl text-gray-600">
              We're a team of passionate experts dedicated to helping businesses thrive in the digital age. With our
              innovative solutions and strategic approach, we transform challenges into opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/2 mb-12 md:mb-0">
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="Our company history"
                className="rounded-lg shadow-xl"
              />
            </div>

            <div className="w-full md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2008, Experio began with a simple mission: to help businesses leverage technology to achieve
                their goals. What started as a small consulting firm has grown into a comprehensive digital solutions
                provider with clients across the globe.
              </p>
              <p className="text-gray-600 mb-4">
                Our journey has been defined by a commitment to excellence, innovation, and client success. We've
                evolved with the changing technological landscape, continuously expanding our expertise to meet the
                emerging needs of businesses in various industries.
              </p>
              <p className="text-gray-600">
                Today, we're proud to be a trusted partner for organizations seeking to navigate digital transformation
                and unlock new opportunities for growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the experts who drive our vision and ensure we deliver exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary mb-4">{member.position}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

