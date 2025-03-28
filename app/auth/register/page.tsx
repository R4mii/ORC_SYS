"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // In a real app, you would call your API here
      // For demo purposes, we'll simulate registration with localStorage

      // Check if user already exists
      const usersJson = localStorage.getItem("users")
      const users = usersJson ? JSON.parse(usersJson) : []

      const existingUser = users.find((u: any) => u.email === formData.email)
      if (existingUser) {
        setErrors({
          email: "Cet email est déjà utilisé",
        })
        setLoading(false)
        return
      }

      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In a real app, you would hash the password
        role: "admin", // First user is admin
        status: "active",
        createdAt: new Date().toISOString(),
      }

      // Save user
      localStorage.setItem("users", JSON.stringify([...users, newUser]))

      // Create default company if none exists
      let companies = JSON.parse(localStorage.getItem("companies") || "[]")
      if (companies.length === 0) {
        companies = [
          {
            id: "1",
            name: "Ma Société",
            identifier: "12345678",
            type: "SARL",
            isFavorite: true,
            lastAccessed: new Date().toLocaleDateString(),
          },
        ]
        localStorage.setItem("companies", JSON.stringify(companies))
      }

      // Initialize document storage for the company
      const documentTypes = ["purchases", "sales", "cashReceipts", "bankStatements"]
      documentTypes.forEach((type) => {
        if (!localStorage.getItem(`${type}_${companies[0].id}`)) {
          localStorage.setItem(`${type}_${companies[0].id}`, JSON.stringify([]))
        }
      })

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      })

      // Redirect to login
      router.push("/auth/login")
    } catch (err) {
      console.error("Registration error:", err)
      setErrors({
        general: "Une erreur est survenue lors de l'inscription",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Besoin.Compta</CardTitle>
          <CardDescription className="text-center">Créez un compte pour commencer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemple@domaine.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

