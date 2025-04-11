"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Building2, ArrowRight, Star, StarOff, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Company {
  id: string
  name: string
  identifier: string
  type: string
  isFavorite: boolean
  lastAccessed?: string
}

interface CompanySelectorProps {
  isOpen: boolean
  onClose: () => void
}

export function CompanySelector({ isOpen, onClose }: CompanySelectorProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: "",
    identifier: "",
    type: "SARL",
  })

  // Get companies from localStorage or use sample data if none exists
  const getCompaniesFromStorage = (): Company[] => {
    // Check if running in browser
    if (typeof window === "undefined") {
      return [
        // Sample company data
        {
          id: "1",
          name: "WANA CORPORATE",
          identifier: "1004450",
          type: "SARL",
          isFavorite: true,
          lastAccessed: "Aujourd'hui, 10:25",
        },
        {
          id: "2",
          name: "HITECK LAND",
          identifier: "1104968",
          type: "SA",
          isFavorite: true,
          lastAccessed: "Hier, 15:30",
        },
        {
          id: "3",
          name: "MAROC TELECOM",
          identifier: "2201345",
          type: "SA",
          isFavorite: false,
          lastAccessed: "12/03/2024",
        },
        {
          id: "4",
          name: "ORANGE MAROC",
          identifier: "3302156",
          type: "SA",
          isFavorite: false,
        },
        {
          id: "5",
          name: "BMCE BANK",
          identifier: "4405789",
          type: "SA",
          isFavorite: false,
        },
      ]
    }

    const storedCompanies = localStorage.getItem("companies")
    if (storedCompanies) {
      return JSON.parse(storedCompanies)
    }

    // Sample company data if none exists
    const sampleCompanies = [
      {
        id: "1",
        name: "WANA CORPORATE",
        identifier: "1004450",
        type: "SARL",
        isFavorite: true,
        lastAccessed: "Aujourd'hui, 10:25",
      },
      {
        id: "2",
        name: "HITECK LAND",
        identifier: "1104968",
        type: "SA",
        isFavorite: true,
        lastAccessed: "Hier, 15:30",
      },
      {
        id: "3",
        name: "MAROC TELECOM",
        identifier: "2201345",
        type: "SA",
        isFavorite: false,
        lastAccessed: "12/03/2024",
      },
      {
        id: "4",
        name: "ORANGE MAROC",
        identifier: "3302156",
        type: "SA",
        isFavorite: false,
      },
      {
        id: "5",
        name: "BMCE BANK",
        identifier: "4405789",
        type: "SA",
        isFavorite: false,
      },
    ]

    // Save sample companies to localStorage
    localStorage.setItem("companies", JSON.stringify(sampleCompanies))
    return sampleCompanies
  }

  const [companies, setCompanies] = useState<Company[]>(getCompaniesFromStorage())

  const saveCompaniesToStorage = (updatedCompanies: Company[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("companies", JSON.stringify(updatedCompanies))
    }
    setCompanies(updatedCompanies)
  }

  const toggleFavorite = (id: string) => {
    const updatedCompanies = companies.map((company) =>
      company.id === id ? { ...company, isFavorite: !company.isFavorite } : company,
    )
    saveCompaniesToStorage(updatedCompanies)
  }

  const selectCompany = (id: string) => {
    // Update last accessed timestamp
    const now = new Date()
    const today = now.toLocaleDateString() === new Date().toLocaleDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = yesterday.toLocaleDateString() === new Date().toLocaleDateString()

    let lastAccessedText = now.toLocaleDateString()
    if (today) {
      lastAccessedText = `Aujourd'hui, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    } else if (isYesterday) {
      lastAccessedText = `Hier, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    }

    const updatedCompanies = companies.map((company) =>
      company.id === id ? { ...company, lastAccessed: lastAccessedText } : company,
    )
    saveCompaniesToStorage(updatedCompanies)

    // Set the selected company in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCompanyId", id)
    }

    // Create empty invoices array for this company if it doesn't exist
    if (typeof window !== "undefined") {
      const companyInvoices = localStorage.getItem(`invoices_${id}`)
      if (!companyInvoices) {
        localStorage.setItem(`invoices_${id}`, JSON.stringify([]))
      }
    }

    router.push("/dashboard")
    onClose()
  }

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.identifier) {
      alert("Veuillez remplir tous les champs obligatoires.")
      return
    }

    const newId = Math.random().toString(36).substring(2, 9)
    const companyToAdd: Company = {
      id: newId,
      name: newCompany.name,
      identifier: newCompany.identifier,
      type: newCompany.type,
      isFavorite: false,
    }

    const updatedCompanies = [...companies, companyToAdd]
    saveCompaniesToStorage(updatedCompanies)

    // Create empty invoices array for this company
    if (typeof window !== "undefined") {
      localStorage.setItem(`invoices_${newId}`, JSON.stringify([]))
    }

    // Reset form and close dialog
    setNewCompany({
      name: "",
      identifier: "",
      type: "SARL",
    })
    setShowAddCompanyDialog(false)
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.identifier.includes(searchTerm),
  )

  const favoriteCompanies = filteredCompanies.filter((company) => company.isFavorite)
  const recentCompanies = filteredCompanies.filter((company) => company.lastAccessed && !company.isFavorite)
  const otherCompanies = filteredCompanies.filter((company) => !company.isFavorite && !company.lastAccessed)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Sélectionner une entreprise</h1>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une entreprise..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddCompanyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une entreprise
          </Button>
        </div>

        {favoriteCompanies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Favoris</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteCompanies.map((company) => (
                <Card key={company.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(company.id)
                        }}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </Button>
                    </div>
                    <CardDescription>
                      {company.identifier} • {company.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {company.lastAccessed && (
                      <p className="text-sm text-muted-foreground">Dernier accès: {company.lastAccessed}</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full" onClick={() => selectCompany(company.id)}>
                      Sélectionner
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {recentCompanies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Récents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCompanies.map((company) => (
                <Card key={company.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(company.id)
                        }}
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {company.identifier} • {company.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {company.lastAccessed && (
                      <p className="text-sm text-muted-foreground">Dernier accès: {company.lastAccessed}</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full" onClick={() => selectCompany(company.id)}>
                      Sélectionner
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {otherCompanies.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Toutes les entreprises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherCompanies.map((company) => (
                <Card key={company.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(company.id)
                        }}
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {company.identifier} • {company.type}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button className="w-full" onClick={() => selectCompany(company.id)}>
                      Sélectionner
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune entreprise trouvée</h3>
            <p className="text-muted-foreground">Aucune entreprise ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      {/* Add Company Dialog */}
      <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une entreprise</DialogTitle>
            <DialogDescription>Remplissez les informations pour ajouter une nouvelle entreprise.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Nom de l'entreprise *</Label>
              <Input
                id="company-name"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-identifier">Identifiant fiscal *</Label>
              <Input
                id="company-identifier"
                value={newCompany.identifier}
                onChange={(e) => setNewCompany({ ...newCompany, identifier: e.target.value })}
                placeholder="Identifiant fiscal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-type">Type d'entreprise</Label>
              <Select value={newCompany.type} onValueChange={(value) => setNewCompany({ ...newCompany, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SARL">SARL</SelectItem>
                  <SelectItem value="SA">SA</SelectItem>
                  <SelectItem value="SAS">SAS</SelectItem>
                  <SelectItem value="EURL">EURL</SelectItem>
                  <SelectItem value="SNC">SNC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCompanyDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCompany}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
