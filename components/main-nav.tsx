import type React from "react"
import { BarChart, Book, CreditCard, LayoutDashboard, ListChecks, ReceiptText, Settings, Users } from "lucide-react"

interface MainNavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ReactNode
  label?: string
}

interface MainNavProps {
  items?: MainNavItem[]
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      {items?.map((item, index) => (
        <div key={index}>
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center text-sm font-medium transition-colors hover:text-foreground/80 sm:text-base"
            >
              {item.title}
            </Link>
          ) : (
            <span className="flex items-center text-sm font-medium text-muted-foreground sm:text-base">
              {item.title}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

import Link from "next/link"

export const defaultNavItems: MainNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Document Processing",
    href: "/dashboard/document-processing",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Financials",
    items: [
      {
        title: "Journal Entries",
        href: "/dashboard/financial/journal-entries",
        icon: <ReceiptText className="h-4 w-4" />,
      },
      {
        title: "General Ledger",
        href: "/dashboard/financial/general-ledger",
        icon: <Book className="h-4 w-4" />,
      },
      {
        title: "Chart of Accounts",
        href: "/dashboard/financial/chart-of-accounts",
        icon: <ListChecks className="h-4 w-4" />,
      },
    ],
    icon: <BarChart className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: <BarChart className="h-4 w-4" />,
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]
