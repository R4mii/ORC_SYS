"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Define theme types
type ColorMode = "light" | "dark"
type ColorTheme = "blue" | "teal" | "purple" | "green"

interface ThemeContextType {
  colorMode: ColorMode
  colorTheme: ColorTheme
  setColorMode: (mode: ColorMode) => void
  setColorTheme: (theme: ColorTheme) => void
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colorMode: "light",
  colorTheme: "blue",
  setColorMode: () => {},
  setColorTheme: () => {},
})

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available
  const [colorMode, setColorMode] = useState<ColorMode>("light")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("blue")

  // Apply theme on mount and when changed
  useEffect(() => {
    // Load saved preferences
    const savedMode = localStorage.getItem("colorMode") as ColorMode
    const savedTheme = localStorage.getItem("colorTheme") as ColorTheme

    if (savedMode) setColorMode(savedMode)
    if (savedTheme) setColorTheme(savedTheme)

    // Apply dark mode class if needed
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Apply theme class
    document.documentElement.setAttribute("data-theme", savedTheme || "blue")
  }, [])

  // Update localStorage and apply changes when theme changes
  useEffect(() => {
    localStorage.setItem("colorMode", colorMode)
    localStorage.setItem("colorTheme", colorTheme)

    if (colorMode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    document.documentElement.setAttribute("data-theme", colorTheme)
  }, [colorMode, colorTheme])

  return (
    <ThemeContext.Provider value={{ colorMode, colorTheme, setColorMode, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook for using the theme
export function useTheme() {
  return useContext(ThemeContext)
}
