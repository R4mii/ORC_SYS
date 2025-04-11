"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2, UserPlus } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "accountant"
  status: "active" | "inactive"
  createdAt: string
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Initialize with sample data if no users exist
      const sampleUsers: User[] = [
        {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          role: "user",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Accountant",
          email: "accountant@example.com",
          role: "accountant",
          status: "inactive",
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(sampleUsers)
      localStorage.setItem("users", JSON.stringify(sampleUsers))
    }
  }, [])

  // Validate user form
  const validateUserForm = (data: typeof newUser, isEdit = false) => {
    const errors: Record<string, string> = {}

    if (!data.name.trim()) {
      errors.name = "Le nom est requis"
    }

    if (!data.email.trim()) {
      errors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Format d'email invalide"
    }

    if (!isEdit) {
      if (!data.password) {
        errors.password = "Le mot de passe est requis"
      } else if (data.password.length < 6) {
        errors.password = "Le mot de passe doit contenir au moins 6 caractères"
      }

      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Les mots de passe ne correspondent pas"
      }
    }

    return errors
  }

  // Handle input changes for new user form
  const handleInputChange = (field: string, value: string) => {
    setNewUser({
      ...newUser,
      [field]: value,
    })

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      })
    }
  }

  // Add new user
  const handleAddUser = () => {
    const validationErrors = validateUserForm(newUser)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const newUserData: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUserData]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Reset form and close dialog
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    })
    setIsAddUserOpen(false)

    toast({
      title: "Utilisateur ajouté",
      description: `${newUserData.name} a été ajouté avec succès.`,
    })
  }

  // Edit user
  const handleEditUser = () => {
    if (!currentUser) return

    const validationErrors = validateUserForm({ ...newUser, password: "dummy", confirmPassword: "dummy" }, true)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role as "admin" | "user" | "accountant",
          }
        : user,
    )

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsEditUserOpen(false)

    toast({
      title: "Utilisateur modifié",
      description: `${currentUser.name} a été modifié avec succès.`,
    })
  }

  // Delete user
  const handleDeleteUser = () => {
    if (!currentUser) return

    const updatedUsers = users.filter((user) => user.id !== currentUser.id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsDeleteUserOpen(false)

    toast({
      title: "Utilisateur supprimé",
      description: `${currentUser.name} a été supprimé avec succès.`,
    })
  }

  // Toggle user status
  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: user.status === "active" ? "inactive" : "active",
          }
        : user,
    )

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    const user = updatedUsers.find((u) => u.id === userId)

    toast({
      title: "Statut modifié",
      description: `${user?.name} est maintenant ${user?.status === "active" ? "actif" : "inactif"}.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des utilisateurs</h1>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>Gérez les utilisateurs qui ont accès à votre système.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : user.role === "accountant"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {user.role === "admin"
                        ? "Administrateur"
                        : user.role === "accountant"
                          ? "Comptable"
                          : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                      onClick={() => toggleUserStatus(user.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {user.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentUser(user)
                          setNewUser({
                            name: user.name,
                            email: user.email,
                            password: "",
                            confirmPassword: "",
                            role: user.role,
                          })
                          setIsEditUserOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setCurrentUser(user)
                          setIsDeleteUserOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>Créez un nouvel utilisateur pour accéder au système.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" value={newUser.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={newUser.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="accountant">Comptable</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Modifiez les informations de l'utilisateur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input id="edit-name" value={newUser.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={newUser.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="accountant">Comptable</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditUser}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Vous êtes sur le point de supprimer l'utilisateur <strong>{currentUser?.name}</strong> (
              {currentUser?.email}).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
