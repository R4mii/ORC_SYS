"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/solutions/invoicing" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold text-finance-primary">
                ORC<span className="text-finance-accent">SYS</span>
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    pathname === item.href
                      ? "text-finance-primary bg-finance-light dark:bg-finance-dark dark:text-finance-accent"
                      : "text-muted-foreground hover:text-finance-primary hover:bg-muted/50"
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
            <div className="ml-4 flex items-center space-x-2">
              <ModeToggle />
              <Button
                asChild
                variant="default"
                className="bg-finance-primary hover:bg-finance-accent text-white button-hover"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="bg-background border-b border-border space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  block px-3 py-2 text-base font-medium rounded-md transition-colors
                  ${
                    pathname === item.href
                      ? "text-finance-primary bg-finance-light dark:bg-finance-dark dark:text-finance-accent"
                      : "text-muted-foreground hover:text-finance-primary hover:bg-muted/50"
                  }
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex justify-center">
              <Button asChild className="w-full bg-finance-primary hover:bg-finance-accent text-white">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
