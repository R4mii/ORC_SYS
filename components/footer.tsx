"use client"

import Link from "next/link"
import { FileText } from "lucide-react"

export function Footer() {
  // Check if we're in the dashboard
  const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard")

  // Return a simplified footer for dashboard pages
  if (isDashboard) {
    return (
      <footer className="bg-background border-t py-3 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">ORCSYS © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/support" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
          </div>
          <div className="text-xs text-muted-foreground hidden md:block">v2.1.0</div>
        </div>
      </footer>
    )
  }

  // Return the full footer for non-dashboard pages
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col space-y-6 md:w-2/3">
          <div className="flex flex-col space-y-2">
            <span className="text-2xl font-bold text-finance-primary">
              ORC<span className="text-finance-accent">SYS</span>
            </span>
            <p className="text-sm text-muted-foreground max-w-md">
              Streamline your financial workflows with our cutting-edge OCR technology and automated document processing
              solutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Products</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/solutions/invoicing"
                    className="text-sm text-muted-foreground hover:text-finance-primary"
                  >
                    Invoicing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions/reporting"
                    className="text-sm text-muted-foreground hover:text-finance-primary"
                  >
                    Reporting
                  </Link>
                </li>
                <li>
                  <Link href="/solutions/tax" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Tax
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Resources</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <Link href="/services" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-finance-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0">
          <h3 className="text-sm font-semibold text-foreground">Connect with us</h3>
          <div className="flex space-x-6 mt-4">
            <Link href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8 border-t border-border mt-12">
        <div className="flex justify-center space-x-6 md:order-2">
          <p className="text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-finance-primary">
              Privacy Policy
            </Link>
            {" • "}
            <Link href="/terms" className="hover:text-finance-primary">
              Terms of Service
            </Link>
            {" • "}
            <Link href="/cookies" className="hover:text-finance-primary">
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="mt-4 md:order-1 md:mt-0">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ORCSYS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
