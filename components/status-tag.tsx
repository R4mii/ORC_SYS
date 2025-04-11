import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  DollarSign,
  FileCheck,
  type LucideIcon,
} from "lucide-react"

type StatusType =
  | "draft"
  | "pending"
  | "processing"
  | "validated"
  | "rejected"
  | "paid"
  | "unpaid"
  | "declared"
  | "undeclared"

interface StatusTagProps {
  status: StatusType
  size?: "sm" | "md" | "lg"
}

export function StatusTag({ status, size = "md" }: StatusTagProps) {
  // Define status configurations
  const statusConfig: Record<
    StatusType,
    {
      label: string
      variant: "outline" | "default" | "secondary" | "destructive"
      icon: LucideIcon
      className: string
    }
  > = {
    draft: {
      label: "Brouillon",
      variant: "outline",
      icon: FileText,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    pending: {
      label: "En cours",
      variant: "outline",
      icon: Clock,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    processing: {
      label: "Traitement",
      variant: "outline",
      icon: Clock,
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    validated: {
      label: "Validé",
      variant: "outline",
      icon: CheckCircle,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    rejected: {
      label: "Refusé",
      variant: "outline",
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    paid: {
      label: "Payé",
      variant: "outline",
      icon: DollarSign,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    unpaid: {
      label: "Non payé",
      variant: "outline",
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
    declared: {
      label: "Déclaré",
      variant: "outline",
      icon: FileCheck,
      className: "bg-green-50 text-green-700 border-green-200",
    },
    undeclared: {
      label: "Non déclaré",
      variant: "outline",
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
  }

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "px-3 py-1",
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}>
      <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
      {config.label}
    </Badge>
  )
}
