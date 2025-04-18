import { BarChart3, FileText, Search, Sigma, Sparkles, Upload } from "lucide-react"

export default function Features() {
  const features = [
    {
      name: "OCR Document Processing",
      description:
        "Extract data from invoices and other financial documents with high accuracy using advanced OCR technology.",
      icon: FileText,
    },
    {
      name: "Automated Data Entry",
      description: "Eliminate manual data entry errors with our intelligent document processing system.",
      icon: Sparkles,
    },
    {
      name: "Document Search",
      description:
        "Quickly find any document with our powerful search capabilities that scan both metadata and content.",
      icon: Search,
    },
    {
      name: "Easy Upload",
      description: "Upload documents through our intuitive interface or directly from email attachments.",
      icon: Upload,
    },
    {
      name: "Financial Analytics",
      description: "Get real-time insights into your financial data with customizable dashboards and reports.",
      icon: BarChart3,
    },
    {
      name: "Tax Calculations",
      description: "Automatically calculate VAT and other taxes based on your invoice data.",
      icon: Sigma,
    },
  ]

  return (
    <div className="bg-white dark:bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight gradient-heading sm:text-4xl">
            Powerful OCR & Financial Features
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our platform provides all the tools you need to transform your financial document processing and analysis.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group flex flex-col card-shadow rounded-xl p-6 border border-border/50 bg-card hover:border-finance-accent/50 transition-colors"
              >
                <dt className="flex items-center gap-x-4 text-lg font-semibold leading-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-finance-light dark:bg-finance-dark text-finance-primary group-hover:bg-finance-primary group-hover:text-white transition-colors">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-foreground">{feature.name}</span>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
