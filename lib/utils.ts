import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return ""

  const date = typeof dateString === "string" ? new Date(dateString) : dateString

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date"

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
