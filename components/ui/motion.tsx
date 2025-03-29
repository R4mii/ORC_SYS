"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  from?: "bottom" | "top" | "left" | "right" | "none"
  distance?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  from = "bottom",
  distance = 20,
}: FadeInProps) {
  const directions = {
    top: { y: -distance },
    bottom: { y: distance },
    left: { x: -distance },
    right: { x: distance },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[from] }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({
  children,
  className,
  from = "right",
  duration = 0.3,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  from?: "left" | "right" | "top" | "bottom"
  duration?: number
  delay?: number
}) {
  const directions = {
    left: { x: "-100%" },
    right: { x: "100%" },
    top: { y: "-100%" },
    bottom: { y: "100%" },
  }

  return (
    <motion.div
      initial={directions[from]}
      animate={{ x: 0, y: 0 }}
      exit={directions[from]}
      transition={{ duration, delay, ease: [0.32, 0.72, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  className,
  duration = 0.3,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  duration?: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedTabs({
  children,
  className,
  activeTab,
}: {
  children: ReactNode
  className?: string
  activeTab: string
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <AnimatePresence>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        />
      </AnimatePresence>
    </div>
  )
}

export function Stagger({
  children,
  className,
  staggerDelay = 0.05,
  initialDelay = 0,
}: {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  initialDelay?: number
}) {
  return (
    <div className={className}>
      {Array.isArray(children) &&
        children.map((child, i) => (
          <FadeIn key={i} delay={initialDelay + i * staggerDelay}>
            {child}
          </FadeIn>
        ))}
    </div>
  )
}

export function AnimatedNumber({
  value,
  duration = 1,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className} key={value}>
      <motion.span initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration, type: "spring", stiffness: 100 }}>
        {value}
      </motion.span>
    </motion.span>
  )
}

