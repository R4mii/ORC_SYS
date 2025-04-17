"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  BookOpen,
  BarChart,
  Calculator,
  DollarSign,
  Wallet,
  LineChart,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CompanySelector } from "@/components/company-selector"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationIndicator } from "@/components/notification-indicator"

interface NavItem {
  title: string
  href?: string
  items?: NavItem[]
  icon: React.ElementType
}

// Update the navItems array with new sections
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Invoices",
    icon: FileText,
    items: [
      {
        title: "Achats",
        href: "/dashboard/invoices",
        icon: CreditCard,
      },
      {
        title: "Ventes",
        href: "/dashboard/sales",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Rel. bancaires",
    href: "/dashboard/bank-statements",
    icon: Building2,
  },
  {
    title: "Comptabilité",
    icon: BookOpen,
    items: [
      {
        title: "Journal",
        href: "/dashboard/accounting/journal",
        icon: BookOpen,
      },
      {
        title: "Grand Livre",
        href: "/dashboard/accounting/ledger",
        icon: BarChart,
      },
      {
        title: "Plan Comptable",
        href: "/dashboard/accounting/chart-of-accounts",
        icon: LayoutDashboard,
      },
      {
        title: "Gestion TVA",
        href: "/dashboard/accounting/vat",
        icon: Calculator,
      },
    ],
  },
  {
    title: "Banque",
    icon: Wallet,
    items: [
      {
        title: "Rapprochement",
        href: "/dashboard/banking/reconciliation",
        icon: DollarSign,
      },
      {
        title: "Règles bancaires",
        href: "/dashboard/banking/rules",
        icon: BarChart,
      },
      {
        title: "Prévisions",
        href: "/dashboard/banking/forecast",
        icon: LineChart,
      },
    ],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showCompanySelector, setShowCompanySelector] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<{ name: string; id: string } | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Start with collapsed sidebar
  const [notifications, setNotifications] = useState<any[]>([])

  // Prevent hydration errors by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true)

    // Only run this code in the browser
    if (typeof window !== "undefined") {
      // Check if user is logged in
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      // Get the selected company from localStorage
      const companyId = localStorage.getItem("selectedCompanyId")
      if (!companyId) {
        // If no company is selected but user is logged in, show company selector
        setShowCompanySelector(true)
        return
      }

      // Get the sidebar state from localStorage
      const savedSidebarState = localStorage.getItem("sidebarCollapsed")
      if (savedSidebarState !== null) {
        setSidebarCollapsed(savedSidebarState === "true")
      }

      // Get company details
      const companies = JSON.parse(localStorage.getItem("companies") || "[]")
      const company = companies.find((c: any) => c.id === companyId)
      if (company) {
        setCurrentCompany({
          id: company.id,
          name: company.name,
        })
      } else {
        router.push("/auth/login")
      }

      // Load notifications
      const storedNotifications = localStorage.getItem(`notifications_${companyId}`)
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications))
      }
    }
  }, [router])

  // Save sidebar state when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed))
    }
  }, [sidebarCollapsed])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem("selectedCompanyId")
    localStorage.removeItem("token")

    // Redirect to login page
    router.push("/auth/login")
  }

  // Render a simple loading state during server-side rendering
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6" />
            <span className="hidden md:inline-block">Besoin.Compta</span>
          </div>
        </header>
        <div className="flex flex-1">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <FileText className="h-6 w-6" />
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Besoin.Compta
                  </span>
                </Link>
              </div>
              <div className="border-b py-3 px-4">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowCompanySelector(true)}
                >
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{currentCompany?.name || "Select Company"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </div>
              <nav className="grid gap-2 p-4">
                {navItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  ) : item.items ? (
                    <div key={item.title}>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </div>
                      <div className="grid gap-2 pl-6">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                              pathname === subItem.href
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6" />
          <span className="hidden md:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Besoin.Compta
          </span>
        </Link>

        {/* Company Selector Button (Desktop) */}
        <div className="hidden md:flex ml-4">
          <Button variant="outline" className="gap-2" onClick={() => setShowCompanySelector(true)}>
            <Building2 className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{currentCompany?.name || "Select Company"}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <NotificationIndicator count={notifications.filter((n) => !n.read).length} />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Collapsible sidebar */}
        <aside
          className={`border-r bg-muted/40 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
          }`}
        >
          <nav className="grid gap-2 p-4">
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ) : item.items ? (
                <div key={item.title}>
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </div>
                  <div className="grid gap-2 pl-6">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          pathname === subItem.href
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <subItem.icon className="h-4 w-4" />
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Company Selector Modal */}
      <CompanySelector isOpen={showCompanySelector} onClose={() => setShowCompanySelector(false)} />
    </div>
  )
}
