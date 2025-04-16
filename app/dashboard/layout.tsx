import type React from "react"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                <span>ORCSYS</span>
              </Link>
              <Link
                href="/dashboard"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Tableau de bord
              </Link>
              <Link
                href="/dashboard/invoices"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Factures
              </Link>
              <Link
                href="/dashboard/bank-statements"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Relevés Bancaires
              </Link>
              <Link
                href="/dashboard/ocr-results"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Résultats OCR
              </Link>
              <Link
                href="/dashboard/reports"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Rapports
              </Link>
              <Link
                href="/dashboard/settings"
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Paramètres
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <span>ORCSYS</span>
        </Link>
        <MainNav className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r md:flex">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Factures
            </Link>
            <Link
              href="/dashboard/bank-statements"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Relevés Bancaires
            </Link>
            <Link
              href="/dashboard/ocr-results"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Résultats OCR
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Rapports
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Paramètres
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
