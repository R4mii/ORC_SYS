"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

type ToastAction = {
  altText?: string
  onClick: () => void
}

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: ToastAction
  duration?: number
  variant?: "default" | "destructive"
}

interface ToastContextProps {
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextProps>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((props: Omit<ToastProps, "id">) => {
    const id = String(Date.now())
    setToasts((prev) => [...prev, { id, ...props }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length && toasts[0].duration !== 0) {
      const timer = setTimeout(() => {
        dismiss(toasts[0].id)
      }, toasts[0].duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [toasts, dismiss])

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{`{children}`}</ToastContext.Provider>
}

export function useToast() {
  return useContext(ToastContext)
}
