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
  Bell,
  Search,
  User,
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Suspense } from "react"

interface NavItem {
  title: string
  href?: string
  items?: NavItem[]
  icon: React.ElementType
}

// Update the navItems array
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // Start with expanded sidebar

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

  const handleContactSupport = () => {
    // Redirect to support page
    router.push("/support")
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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
        {/* Only show sidebar toggle if not on dashboard or if on dashboard on larger screens */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`mr-2 text-muted-foreground hover:text-foreground ${pathname === "/dashboard" ? "hidden md:flex" : ""}`}
        >
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
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold">
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
                    <Building2 className="mr-2 h-4 w-4 text-primary" />
                    <span className="truncate">{currentCompany?.name || "Select Company"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </div>
              <nav className={`grid gap-2 p-4 ${pathname === "/dashboard" ? "hidden" : ""}`}>
                {navItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
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
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
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
          <FileText className="h-6 w-6 text-primary" />
          <span className="hidden md:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold">
            Besoin.Compta
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 mx-4 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/40 border-muted focus-visible:bg-background" />
          </div>
        </div>

        {/* Company Selector Button (Desktop) */}
        <div className="hidden md:flex">
          <Button
            variant="outline"
            className="gap-2 border-muted bg-muted/40 hover:bg-muted"
            onClick={() => setShowCompanySelector(true)}
          >
            <Building2 className="h-4 w-4 text-primary" />
            <span className="max-w-[150px] truncate">{currentCompany?.name || "Select Company"}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start p-3 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1 w-full">
                      <span className="font-medium">New invoice uploaded</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        New
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Invoice #INV-{1000 + i} has been processed</span>
                    <span className="text-xs text-muted-foreground mt-1">2 hour{i > 1 ? "s" : ""} ago</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>My Account</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Collapsible sidebar with enhanced styling */}
        <aside
          className={`border-r bg-background transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
          }`}
        >
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-4">
            <nav className={`grid gap-2 ${pathname === "/dashboard" ? "hidden md:grid" : ""}`}>
              {navItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${pathname === item.href ? "active" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ) : item.items ? (
                  <div key={item.title} className="space-y-2 pt-2">
                    <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    <div className="grid gap-1 pl-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`nav-item ${pathname === subItem.href ? "active" : ""}`}
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
            {/* Bottom section with help and support */}
            <div className="mt-auto pt-6 border-t mt-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-2">Need help?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Contact our support team for assistance with your account.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleContactSupport}>
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Suspense fallback={<>Loading...</>}>{children}</Suspense>
        </main>
      </div>

      {/* Company Selector Modal */}
      <CompanySelector isOpen={showCompanySelector} onClose={() => setShowCompanySelector(false)} />
    </div>
  )
}
