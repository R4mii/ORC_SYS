"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastContextType = {
  toast: (props: ToastProps) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([])

  const toast = (props: ToastProps) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...props, id }])

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, props.duration || 5000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-md max-w-md transform transition-all duration-300 ease-in-out ${
              t.variant === "destructive" ? "bg-red-100 text-red-800" : "bg-white text-gray-800 border"
            }`}
          >
            {t.title && <h4 className="font-medium mb-1">{t.title}</h4>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
