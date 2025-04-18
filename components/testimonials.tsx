import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      content:
        "ORCSYS has revolutionized our accounting workflow. The OCR technology is incredibly accurate, and we've reduced manual data entry by 85%.",
      author: "Sarah Johnson",
      role: "CFO, TechVentures Inc.",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
    },
    {
      content:
        "The automation capabilities have saved our finance team countless hours. We can now focus on analysis rather than data entry.",
      author: "Michael Chen",
      role: "Financial Controller, Global Solutions",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
    },
    {
      content:
        "Implementation was smooth and the customer support has been exceptional. ORCSYS truly understands the needs of modern finance teams.",
      author: "Elena Rodriguez",
      role: "Head of Accounting, Innovate Group",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
    },
  ]

  return (
    <div className="bg-finance-light dark:bg-finance-dark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-finance-primary dark:text-white sm:text-4xl">
            Trusted by Finance Professionals
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground dark:text-muted-foreground/90">
            Discover how ORCSYS is transforming financial document processing for businesses worldwide.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col justify-between card-shadow rounded-xl bg-white dark:bg-finance-dark/50 border border-border p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6">
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-finance-accent text-finance-accent" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i + testimonial.rating} className="h-5 w-5 text-muted-foreground" />
                  ))}
                </div>
                <p className="text-foreground/90">{testimonial.content}</p>
              </div>
              <div className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full bg-gray-100"
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{testimonial.author}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
