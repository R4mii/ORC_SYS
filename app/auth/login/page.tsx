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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs")
      setLoading(false)
      return
    }

    try {
      // In a real app, you would call your API here
      // For demo purposes, we'll simulate authentication with localStorage
      const usersJson = localStorage.getItem("users")

      // If no users exist, create a default admin user
      if (!usersJson || JSON.parse(usersJson).length === 0) {
        const defaultUser = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          password: "admin123", // In a real app, this would be hashed
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        }

        localStorage.setItem("users", JSON.stringify([defaultUser]))

        // If the entered credentials match the default user
        if (email === defaultUser.email && password === defaultUser.password) {
          // Login successful with default user
          loginSuccessful(defaultUser)
          return
        }
      } else {
        const users = JSON.parse(usersJson)

        // Find user by email (case insensitive)
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active")

        if (!user) {
          setError("Utilisateur non trouvé ou inactif")
          setLoading(false)
          return
        }

        // In a real app, you would verify the password with bcrypt
        // For demo, we'll just do a simple comparison
        if (user.password !== password) {
          setError("Mot de passe incorrect")
          setLoading(false)
          return
        }

        // Login successful
        loginSuccessful(user)
        return
      }

      // If we get here, login failed
      setError("Email ou mot de passe incorrect")
      setLoading(false)
    } catch (err) {
      console.error("Login error:", err)
      setError("Une erreur est survenue lors de la connexion")
      setLoading(false)
    }
  }

  const loginSuccessful = (user: any) => {
    // Generate a simple JWT-like token
    const token = btoa(
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    )

    // Store token in localStorage
    localStorage.setItem("token", token)

    // Get companies or create a default one
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

    // Set selected company
    localStorage.setItem("selectedCompanyId", companies[0].id)

    // Create empty invoices array for this company if it doesn't exist
    if (!localStorage.getItem(`invoices_${companies[0].id}`)) {
      localStorage.setItem(`invoices_${companies[0].id}`, JSON.stringify([]))
    }

    // Create empty arrays for other document types
    const documentTypes = ["purchases", "sales", "cashReceipts", "bankStatements"]
    documentTypes.forEach((type) => {
      if (!localStorage.getItem(`${type}_${companies[0].id}`)) {
        localStorage.setItem(`${type}_${companies[0].id}`, JSON.stringify([]))
      }
    })

    toast({
      title: "Connexion réussie",
      description: "Vous êtes maintenant connecté.",
    })

    // Redirect to dashboard
    router.push("/dashboard")
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Besoin.Compta</CardTitle>
          <CardDescription className="text-center">Connectez-vous à votre compte pour continuer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col">
          <div className="mt-4 pt-4 border-t">
            <p className="text-center text-sm text-muted-foreground mb-4">Accès rapide pour test</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Create a default user if needed
                  const usersJson = localStorage.getItem("users")
                  const users = usersJson ? JSON.parse(usersJson) : []

                  // Check if user exists, if not create one
                  if (!users.some((u) => u.role === "user")) {
                    const defaultUser = {
                      id: "2",
                      name: "Regular User",
                      email: "user@example.com",
                      password: "user123",
                      role: "user",
                      status: "active",
                      createdAt: new Date().toISOString(),
                    }
                    users.push(defaultUser)
                    localStorage.setItem("users", JSON.stringify(users))
                  }

                  // Login as user
                  const user = users.find((u) => u.role === "user") || {
                    id: "2",
                    name: "Regular User",
                    email: "user@example.com",
                    role: "user",
                  }

                  loginSuccessful(user)
                }}
              >
                Utilisateur
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  // Create a default admin if needed
                  const usersJson = localStorage.getItem("users")
                  const users = usersJson ? JSON.parse(usersJson) : []

                  // Check if admin exists, if not create one
                  if (!users.some((u) => u.role === "admin")) {
                    const defaultAdmin = {
                      id: "1",
                      name: "Admin User",
                      email: "admin@example.com",
                      password: "admin123",
                      role: "admin",
                      status: "active",
                      createdAt: new Date().toISOString(),
                    }
                    users.push(defaultAdmin)
                    localStorage.setItem("users", JSON.stringify(users))
                  }

                  // Login as admin
                  const admin = users.find((u) => u.role === "admin") || {
                    id: "1",
                    name: "Admin User",
                    email: "admin@example.com",
                    role: "admin",
                  }

                  loginSuccessful(admin)
                }}
              >
                Administrateur
              </Button>
            </div>
          </div>
          <div className="text-center text-sm">
            Vous n'avez pas de compte?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
