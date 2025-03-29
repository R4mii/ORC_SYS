"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Receipt, Settings, FileSpreadsheet, Calculator, CreditCard, Users } from "lucide-react"

export function MainSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] transition-all duration-300 ${isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"}`}
    >
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calculator className="h-6 w-6" />
          {!isCollapsed && <span>Experio</span>}
        </div>
        <button
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <div className="mb-2">
            {!isCollapsed && <h3 className="mb-1 px-4 text-xs font-medium text-muted-foreground">Navigation</h3>}
            <div className="grid gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/dashboard" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <Home className="h-4 w-4" />
                {!isCollapsed && <span>Tableau de bord</span>}
              </Link>
              <Link
                href="/invoices"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/invoices" || pathname.startsWith("/invoices/") ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <Receipt className="h-4 w-4" />
                {!isCollapsed && <span>Factures</span>}
              </Link>
              <Link
                href="/accountings"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/accountings" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {!isCollapsed && <span>Écritures comptables</span>}
              </Link>
            </div>
          </div>

          <div className="mb-2">
            {!isCollapsed && <h3 className="mb-1 px-4 text-xs font-medium text-muted-foreground">Administration</h3>}
            <div className="grid gap-1">
              <Link
                href="/accounts"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/accounts" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <CreditCard className="h-4 w-4" />
                {!isCollapsed && <span>Comptes</span>}
              </Link>
              <Link
                href="/vendors"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/vendors" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <Users className="h-4 w-4" />
                {!isCollapsed && <span>Fournisseurs</span>}
              </Link>
              <Link
                href="/documents"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/documents" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
              >
                <FileText className="h-4 w-4" />
                {!isCollapsed && <span>Documents</span>}
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] ${pathname === "/settings" ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] font-medium" : ""}`}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Paramètres</span>}
        </Link>
      </div>
    </aside>
  )
}

