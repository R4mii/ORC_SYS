"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()

  // Don't show the footer on auth or dashboard pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/dashboard")) {
    return null
  }

  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col gap-8 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-2">
            <Link href="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Experio</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Streamline your financial operations with our intuitive accounting platform. Designed for modern
              businesses.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Solutions</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/solutions/accounting"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Accounting
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/invoicing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Invoicing
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/reporting"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reporting
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/tax"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tax Management
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Experio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              LinkedIn
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Facebook
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

