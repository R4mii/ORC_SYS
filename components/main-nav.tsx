import type { MainNavItem } from "@/types"
import {
  Activity,
  BarChart,
  Book,
  Calendar,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

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
    title: "Sales",
    href: "/sales",
    icon: <BarChart className="h-4 w-4" />,
  },
  {
    title: "Products",
    href: "/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Invoice Upload",
    href: "/invoice-upload",
    icon: <ReceiptText className="h-4 w-4" />,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    title: "Activity",
    href: "/activity",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: <Book className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]
