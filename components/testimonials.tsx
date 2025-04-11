import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Working with Experio transformed our business. Their digital solutions helped us increase efficiency by 40%.",
    author: "Sarah Johnson",
    position: "CEO, TechStart Inc.",
    rating: 5,
  },
  {
    quote: "The custom software they developed perfectly addressed our unique challenges. Highly recommended!",
    author: "Michael Chen",
    position: "CTO, GrowthWave",
    rating: 5,
  },
  {
    quote:
      "Their strategic consulting provided invaluable insights that helped us navigate our digital transformation.",
    author: "Emma Rodriguez",
    position: "Operations Director, Innovate Ltd",
    rating: 4,
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from some of our satisfied clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
