"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export function Footer() {
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
                  <Link href="#" className="text-sm text-muted-foreground hover:text-finance-primary">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0">
          <h3 className="text-sm font-semibold text-foreground">Connect with us</h3>
          <div className="flex space-x-6 mt-4">
            <a href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-finance-primary">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8 border-t border-border mt-12">
        <div className="flex justify-center space-x-6 md:order-2">
          <p className="text-xs text-muted-foreground">
            <Link href="#" className="hover:text-finance-primary">
              Privacy Policy
            </Link>
            {" • "}
            <Link href="#" className="hover:text-finance-primary">
              Terms of Service
            </Link>
            {" • "}
            <Link href="#" className="hover:text-finance-primary">
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
