"use client"

import Link from "next/link"
import { HelpCircle, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-primary">
              ORC<span className="text-accent">SYS</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/support" className="text-sm text-muted-foreground hover:text-primary flex items-center">
              <HelpCircle className="h-4 w-4 mr-1" />
              Support
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ORCSYS. All rights reserved.
          </p>
          <div className="mt-2 md:mt-0">
            <p className="text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              {" • "}
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
