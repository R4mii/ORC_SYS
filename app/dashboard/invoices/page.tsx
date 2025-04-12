"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InvoicesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to achats by default
    router.push("/dashboard/invoices/achats")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirection...</p>
    </div>
  )
}
