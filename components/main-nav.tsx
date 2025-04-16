"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Tableau de bord
      </Link>
      <Link
        href="/dashboard/invoices"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/invoices" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Factures
      </Link>
      <Link
        href="/dashboard/bank-statements"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/bank-statements" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Relevés Bancaires
      </Link>
      <Link
        href="/dashboard/reports"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/reports" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Rapports
      </Link>
      <Link
        href="/dashboard/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Paramètres
      </Link>
    </nav>
  )
}
