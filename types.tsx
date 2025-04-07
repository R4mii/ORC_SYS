import type React from "react"
export type MainNavItem = {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ReactNode
  label?: string
}

