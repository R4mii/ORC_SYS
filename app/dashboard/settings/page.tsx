"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, ImageIcon, Loader2, Save, RefreshCw, Upload, Plus, Trash2, Edit2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Define form schema
const companyProfileSchema = z.object({
  companyName: z.string().min(2, {
    message: "Le nom de l'entreprise doit comporter au moins 2 caractères.",
  }),
  taxId: z.string().min(5, {
    message: "Le numéro d'identification fiscale doit comporter au moins 5 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().min(6, {
    message: "Le numéro de téléphone doit comporter au moins 6 caractères.",
  }),
  address: z.object({
    street: z.string().min(2, {
      message: "L'adresse est requise.",
    }),
    city: z.string().min(2, {
      message: "La ville est requise.",
    }),
    postalCode: z.string().min(2, {
      message: "Le code postal est requis.",
    }),
    country: z.string().min(2, {
      message: "Le pays est requis.",
    }),
  }),
  fiscalYear: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  language: z.string().default("fr"),
  currency: z.string().default("MAD"),
  timezone: z.string().default("Africa/Casablanca"),
})

// Financial settings schema
const financialSettingsSchema = z.object({
  invoiceNumberFormat: z.string().min(2, {
    message: "Le format de numérotation des factures est requis.",
  }),
  defaultPaymentTerms: z.number().int().positive(),
  nextInvoiceNumber: z.number().int().positive(),
})

// Sample timezone data
const timezones = [
  { value: "Africa/Casablanca", label: "Casablanca (UTC+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12/+13)" },
]

// Types for financial settings
interface TaxRate {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface ChartAccount {
  id: string
  code: string
  name: string
  type: string
  description: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("general")
  const [isUploading, setIsUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Financial settings state
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    { id: "1", name: "TVA Standard", rate: 20, isDefault: true },
    { id: "2", name: "TVA Réduite", rate: 14, isDefault: false },
    { id: "3", name: "TVA Super Réduite", rate: 7, isDefault: false },
    { id: "4", name: "Exonéré", rate: 0, isDefault: false },
  ])

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "1", name: "Virement bancaire", description: "Paiement par virement bancaire", isActive: true },
    { id: "2", name: "Carte bancaire", description: "Paiement par carte bancaire", isActive: true },
    { id: "3", name: "Espèces", description: "Paiement en espèces", isActive: true },
    { id: "4", name: "Chèque", description: "Paiement par chèque", isActive: true },
  ])

  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([
    { id: "1", code: "101000", name: "Capital", type: "Capitaux", description: "Capital social" },
    { id: "2", code: "512000", name: "Banque", type: "Trésorerie", description: "Compte bancaire principal" },
    { id: "3", code: "401000", name: "Fournisseurs", type: "Dettes", description: "Comptes fournisseurs" },
    { id: "4", code: "411000", name: "Clients", type: "Créances", description: "Comptes clients" },
    { id: "5", code: "607000", name: "Achats", type: "Charges", description: "Achats de marchandises" },
    { id: "6", code: "707000", name: "Ventes", type: "Produits", description: "Ventes de marchandises" },
  ])

  // Dialog states for financial settings
  const [newTaxRate, setNewTaxRate] = useState<Omit<TaxRate, "id">>({ name: "", rate: 0, isDefault: false })
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null)
  const [taxRateToDelete, setTaxRateToDelete] = useState<string | null>(null)

  const [newPaymentMethod, setNewPaymentMethod] = useState<Omit<PaymentMethod, "id">>({
    name: "",
    description: "",
    isActive: true,
  })
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null)

  const [newChartAccount, setNewChartAccount] = useState<Omit<ChartAccount, "id">>({
    code: "",
    name: "",
    type: "",
    description: "",
  })
  const [editingChartAccount, setEditingChartAccount] = useState<ChartAccount | null>(null)
  const [chartAccountToDelete, setChartAccountToDelete] = useState<string | null>(null)

  // Initialize notifications and appearance settings
  const [notificationsSettings, setNotificationsSettings] = useState({
    emailNotifications: false,
    invoiceReminders: false,
    systemUpdates: true,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactMode: false,
    highContrast: false,
  })

  const [apiSettings, setApiSettings] = useState({
    ocrApiKey: "",
    ocrLanguage: "fre",
  })

  // Initialize form with default values
  const form = useForm<z.infer<typeof companyProfileSchema>>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "ORCSYS Financial",
      taxId: "TAX123456789",
      email: "contact@orcsys.com",
      phone: "+212 522 123 456",
      address: {
        street: "123 Rue Financière",
        city: "Casablanca",
        postalCode: "20000",
        country: "Maroc",
      },
      fiscalYear: {
        startDate: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
        endDate: new Date(new Date().getFullYear(), 11, 31), // Dec 31st of current year
      },
      language: "fr",
      currency: "MAD",
      timezone: "Africa/Casablanca",
    },
  })

  // Initialize financial settings form
  const financialForm = useForm<z.infer<typeof financialSettingsSchema>>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: {
      invoiceNumberFormat: "INV-{YEAR}-{NUMBER}",
      defaultPaymentTerms: 30,
      nextInvoiceNumber: 1001,
    },
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load company profile settings
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)

      // Convert string dates to Date objects
      if (parsedSettings.general) {
        const formValues = {
          companyName: parsedSettings.general.companyName || "ORCSYS Financial",
          taxId: parsedSettings.general.taxId || "TAX123456789",
          email: parsedSettings.general.email || "contact@orcsys.com",
          phone: parsedSettings.general.phone || "+212 522 123 456",
          address: {
            street: parsedSettings.general.address?.street || "123 Rue Financière",
            city: parsedSettings.general.address?.city || "Casablanca",
            postalCode: parsedSettings.general.address?.postalCode || "20000",
            country: parsedSettings.general.address?.country || "Maroc",
          },
          fiscalYear: {
            startDate: parsedSettings.general.fiscalYear?.startDate
              ? new Date(parsedSettings.general.fiscalYear.startDate)
              : new Date(new Date().getFullYear(), 0, 1),
            endDate: parsedSettings.general.fiscalYear?.endDate
              ? new Date(parsedSettings.general.fiscalYear.endDate)
              : new Date(new Date().getFullYear(), 11, 31),
          },
          language: parsedSettings.general.language || "fr",
          currency: parsedSettings.general.currency || "MAD",
          timezone: parsedSettings.general.timezone || "Africa/Casablanca",
        }
        form.reset(formValues)
      }

      // Load financial settings
      if (parsedSettings.financial) {
        financialForm.reset({
          invoiceNumberFormat: parsedSettings.financial.invoiceNumberFormat || "INV-{YEAR}-{NUMBER}",
          defaultPaymentTerms: parsedSettings.financial.defaultPaymentTerms || 30,
          nextInvoiceNumber: parsedSettings.financial.nextInvoiceNumber || 1001,
        })

        if (parsedSettings.financial.taxRates) {
          setTaxRates(parsedSettings.financial.taxRates)
        }

        if (parsedSettings.financial.paymentMethods) {
          setPaymentMethods(parsedSettings.financial.paymentMethods)
        }

        if (parsedSettings.financial.chartAccounts) {
          setChartAccounts(parsedSettings.financial.chartAccounts)
        }
      }

      // Load other settings
      if (parsedSettings.notifications) {
        setNotificationsSettings(parsedSettings.notifications)
      }

      if (parsedSettings.api) {
        setApiSettings(parsedSettings.api)
      }

      // Load company logo
      const savedLogo = localStorage.getItem("companyLogo")
      if (savedLogo) {
        setLogoPreview(savedLogo)
      }
    }

    // Set appearance settings based on current theme
    setAppearanceSettings((prev) => ({
      ...prev,
      darkMode: theme === "dark",
    }))
  }, [form, financialForm, theme])

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setLogoPreview(result)
          localStorage.setItem("companyLogo", result)
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      }, 1000)
    }
  }

  // Handle notification settings changes
  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationsSettings({
      ...notificationsSettings,
      [field]: value,
    })
  }

  // Handle appearance changes
  const handleAppearanceChange = (field: string, value: boolean) => {
    // Update settings state
    setAppearanceSettings({
      ...appearanceSettings,
      [field]: value,
    })

    // Apply theme change if darkMode is toggled
    if (field === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  // Handle API settings changes
  const handleApiChange = (field: string, value: string) => {
    setApiSettings({
      ...apiSettings,
      [field]: value,
    })
  }

  // Tax rates handlers
  const handleAddTaxRate = () => {
    const newId = (taxRates.length + 1).toString()
    setTaxRates([...taxRates, { id: newId, ...newTaxRate }])
    setNewTaxRate({ name: "", rate: 0, isDefault: false })
    toast({
      title: "Taux de TVA ajouté",
      description: `Le taux de TVA ${newTaxRate.name} a été ajouté avec succès.`,
    })
  }

  const handleUpdateTaxRate = () => {
    if (editingTaxRate) {
      setTaxRates(taxRates.map((tax) => (tax.id === editingTaxRate.id ? editingTaxRate : tax)))
      setEditingTaxRate(null)
      toast({
        title: "Taux de TVA mis à jour",
        description: `Le taux de TVA ${editingTaxRate.name} a été mis à jour avec succès.`,
      })
    }
  }

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter((tax) => tax.id !== id))
    setTaxRateToDelete(null)
    toast({
      title: "Taux de TVA supprimé",
      description: "Le taux de TVA a été supprimé avec succès.",
    })
  }

  // Payment methods handlers
  const handleAddPaymentMethod = () => {
    const newId = (paymentMethods.length + 1).toString()
    setPaymentMethods([...paymentMethods, { id: newId, ...newPaymentMethod }])
    setNewPaymentMethod({ name: "", description: "", isActive: true })
    toast({
      title: "Méthode de paiement ajoutée",
      description: `La méthode de paiement ${newPaymentMethod.name} a été ajoutée avec succès.`,
    })
  }

  const handleUpdatePaymentMethod = () => {
    if (editingPaymentMethod) {
      setPaymentMethods(
        paymentMethods.map((method) => (method.id === editingPaymentMethod.id ? editingPaymentMethod : method)),
      )
      setEditingPaymentMethod(null)
      toast({
        title: "Méthode de paiement mise à jour",
        description: `La méthode de paiement ${editingPaymentMethod.name} a été mise à jour avec succès.`,
      })
    }
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
    setPaymentMethodToDelete(null)
    toast({
      title: "Méthode de paiement supprimée",
      description: "La méthode de paiement a été supprimée avec succès.",
    })
  }

  // Chart of accounts handlers
  const handleAddChartAccount = () => {
    const newId = (chartAccounts.length + 1).toString()
    setChartAccounts([...chartAccounts, { id: newId, ...newChartAccount }])
    setNewChartAccount({ code: "", name: "", type: "", description: "" })
    toast({
      title: "Compte ajouté",
      description: `Le compte ${newChartAccount.name} a été ajouté avec succès.`,
    })
  }

  const handleUpdateChartAccount = () => {
    if (editingChartAccount) {
      setChartAccounts(
        chartAccounts.map((account) => (account.id === editingChartAccount.id ? editingChartAccount : account)),
      )
      setEditingChartAccount(null)
      toast({
        title: "Compte mis à jour",
        description: `Le compte ${editingChartAccount.name} a été mis à jour avec succès.`,
      })
    }
  }

  const handleDeleteChartAccount = (id: string) => {
    setChartAccounts(chartAccounts.filter((account) => account.id !== id))
    setChartAccountToDelete(null)
    toast({
      title: "Compte supprimé",
      description: "Le compte a été supprimé avec succès.",
    })
  }

  // Save form data
  function onSubmit(values: z.infer<typeof companyProfileSchema>) {
    // Combine all settings
    const allSettings = {
      general: values,
      notifications: notificationsSettings,
      appearance: appearanceSettings,
      api: apiSettings,
    }

    // Save to localStorage
    localStorage.setItem("appSettings", JSON.stringify(allSettings))

    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres ont été sauvegardés avec succès.",
    })
  }

  // Save financial settings
  function onFinancialSubmit(values: z.infer<typeof financialSettingsSchema>) {
    // Combine all financial settings
    const financialSettings = {
      ...values,
      taxRates,
      paymentMethods,
      chartAccounts,
    }

    // Get existing settings
    const existingSettings = localStorage.getItem("appSettings")
    const parsedSettings = existingSettings ? JSON.parse(existingSettings) : {}

    // Update with financial settings
    const updatedSettings = {
      ...parsedSettings,
      financial: financialSettings,
    }

    // Save to localStorage
    localStorage.setItem("appSettings", JSON.stringify(updatedSettings))

    toast({
      title: "Paramètres financiers sauvegardés",
      description: "Vos paramètres financiers ont été sauvegardés avec succès.",
    })
  }

  // Reset settings
  const resetSettings = () => {
    // Reset form to default values
    form.reset({
      companyName: "ORCSYS Financial",
      taxId: "TAX123456789",
      email: "contact@orcsys.com",
      phone: "+212 522 123 456",
      address: {
        street: "123 Rue Financière",
        city: "Casablanca",
        postalCode: "20000",
        country: "Maroc",
      },
      fiscalYear: {
        startDate: new Date(new Date().getFullYear(), 0, 1),
        endDate: new Date(new Date().getFullYear(), 11, 31),
      },
      language: "fr",
      currency: "MAD",
      timezone: "Africa/Casablanca",
    })

    // Reset financial form
    financialForm.reset({
      invoiceNumberFormat: "INV-{YEAR}-{NUMBER}",
      defaultPaymentTerms: 30,
      nextInvoiceNumber: 1001,
    })

    // Reset tax rates
    setTaxRates([
      { id: "1", name: "TVA Standard", rate: 20, isDefault: true },
      { id: "2", name: "TVA Réduite", rate: 14, isDefault: false },
      { id: "3", name: "TVA Super Réduite", rate: 7, isDefault: false },
      { id: "4", name: "Exonéré", rate: 0, isDefault: false },
    ])

    // Reset payment methods
    setPaymentMethods([
      { id: "1", name: "Virement bancaire", description: "Paiement par virement bancaire", isActive: true },
      { id: "2", name: "Carte bancaire", description: "Paiement par carte bancaire", isActive: true },
      { id: "3", name: "Espèces", description: "Paiement en espèces", isActive: true },
      { id: "4", name: "Chèque", description: "Paiement par chèque", isActive: true },
    ])

    // Reset chart accounts
    setChartAccounts([
      { id: "1", code: "101000", name: "Capital", type: "Capitaux", description: "Capital social" },
      { id: "2", code: "512000", name: "Banque", type: "Trésorerie", description: "Compte bancaire principal" },
      { id: "3", code: "401000", name: "Fournisseurs", type: "Dettes", description: "Comptes fournisseurs" },
      { id: "4", code: "411000", name: "Clients", type: "Créances", description: "Comptes clients" },
      { id: "5", code: "607000", name: "Achats", type: "Charges", description: "Achats de marchandises" },
      { id: "6", code: "707000", name: "Ventes", type: "Produits", description: "Ventes de marchandises" },
    ])

    // Reset other settings
    setNotificationsSettings({
      emailNotifications: false,
      invoiceReminders: false,
      systemUpdates: true,
    })

    setApiSettings({
      ocrApiKey: "",
      ocrLanguage: "fre",
    })

    // Reset logo
    setLogoPreview(null)
    localStorage.removeItem("companyLogo")

    toast({
      title: "Paramètres réinitialisés",
      description: "Vos paramètres ont été réinitialisés aux valeurs par défaut.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Paramètres</CardTitle>
            <CardDescription>Configurez les paramètres de votre compte</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={
                activeTab === "financial" ? financialForm.handleSubmit(onFinancialSubmit) : form.handleSubmit(onSubmit)
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="financial">Financier</TabsTrigger>
              <TabsTrigger value="api">API & Intégrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Company Profile Section */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Profil de l'entreprise</CardTitle>
                        <CardDescription>Mettez à jour les informations de votre entreprise</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Company Logo */}
                        <div className="flex flex-col space-y-2">
                          <FormLabel>Logo de l'entreprise</FormLabel>
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                              {logoPreview ? (
                                <img
                                  src={logoPreview || "/placeholder.svg"}
                                  alt="Logo de l'entreprise"
                                  className="h-full w-full object-contain p-2"
                                />
                              ) : (
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                              )}
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/*"
                                  className="max-w-xs"
                                  onChange={handleLogoUpload}
                                />
                                <Button type="button" size="sm" variant="outline">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Télécharger
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Recommandé: Format carré JPG, PNG, ou SVG, minimum 128x128px
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l'entreprise</FormLabel>
                                <FormControl>
                                  <Input placeholder="Entrez le nom de l'entreprise" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro d'identification fiscale</FormLabel>
                                <FormControl>
                                  <Input placeholder="Entrez le numéro d'identification fiscale" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Entrez l'adresse email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro de téléphone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Entrez le numéro de téléphone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Address Fields */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Adresse</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="address.street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rue</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Entrez l'adresse" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ville</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Entrez la ville" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <FormField
                              control={form.control}
                              name="address.postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Code postal</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Entrez le code postal" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="address.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pays</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Entrez le pays" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Language and Currency */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Langue</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionnez une langue" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ar">العربية</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Devise</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionnez une devise" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MAD">Dirham marocain (MAD)</SelectItem>
                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fiscal Year Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Exercice fiscal</CardTitle>
                        <CardDescription>
                          Configurez les dates de début et de fin de votre exercice fiscal
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fiscalYear.startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Début de l'exercice fiscal</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd MMMM yyyy")
                                      ) : (
                                        <span>Sélectionnez une date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fiscalYear.endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fin de l'exercice fiscal</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd MMMM yyyy")
                                      ) : (
                                        <span>Sélectionnez une date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Timezone Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Fuseau horaire</CardTitle>
                        <CardDescription>Configurez le fuseau horaire pour vos opérations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuseau horaire</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timezones.map((timezone) => (
                                    <SelectItem key={timezone.value} value={timezone.value}>
                                      {timezone.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Toutes les dates et heures seront affichées dans ce fuseau horaire
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Financial Settings Tab */}
            <TabsContent value="financial" className="space-y-6 mt-6">
              <Form {...financialForm}>
                <form onSubmit={financialForm.handleSubmit(onFinancialSubmit)} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Invoice Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Paramètres de facturation</CardTitle>
                        <CardDescription>Configurez les paramètres de facturation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={financialForm.control}
                          name="invoiceNumberFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Format de numérotation des factures</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: INV-{YEAR}-{NUMBER}" {...field} />
                              </FormControl>
                              <FormDescription>
                                Utilisez {"{YEAR}"} pour l'année, {"{MONTH}"} pour le mois et {"{NUMBER}"} pour le
                                numéro séquentiel
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={financialForm.control}
                          name="nextInvoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prochain numéro de facture</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Ce numéro sera utilisé pour la prochaine facture créée</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={financialForm.control}
                          name="defaultPaymentTerms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conditions de paiement par défaut (jours)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>Nombre de jours avant l'échéance de paiement</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Tax Rates Management */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle>Taux de TVA</CardTitle>
                          <CardDescription>Gérez les différents taux de TVA</CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Ajouter un taux de TVA</DialogTitle>
                              <DialogDescription>Créez un nouveau taux de TVA pour vos factures.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tax-name" className="text-right">
                                  Nom
                                </Label>
                                <Input
                                  id="tax-name"
                                  value={newTaxRate.name}
                                  onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tax-rate" className="text-right">
                                  Taux (%)
                                </Label>
                                <Input
                                  id="tax-rate"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={newTaxRate.rate}
                                  onChange={(e) =>
                                    setNewTaxRate({ ...newTaxRate, rate: Number.parseFloat(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tax-default" className="text-right">
                                  Par défaut
                                </Label>
                                <div className="col-span-3">
                                  <Switch
                                    id="tax-default"
                                    checked={newTaxRate.isDefault}
                                    onCheckedChange={(checked) => setNewTaxRate({ ...newTaxRate, isDefault: checked })}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleAddTaxRate}>
                                Ajouter
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Taux (%)</TableHead>
                              <TableHead>Par défaut</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taxRates.map((tax) => (
                              <TableRow key={tax.id}>
                                <TableCell className="font-medium">{tax.name}</TableCell>
                                <TableCell>{tax.rate}%</TableCell>
                                <TableCell>
                                  {tax.isDefault && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Par défaut
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setEditingTaxRate(tax)}>
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Modifier le taux de TVA</DialogTitle>
                                          <DialogDescription>
                                            Modifiez les informations du taux de TVA.
                                          </DialogDescription>
                                        </DialogHeader>
                                        {editingTaxRate && (
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-tax-name" className="text-right">
                                                Nom
                                              </Label>
                                              <Input
                                                id="edit-tax-name"
                                                value={editingTaxRate.name}
                                                onChange={(e) =>
                                                  setEditingTaxRate({ ...editingTaxRate, name: e.target.value })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-tax-rate" className="text-right">
                                                Taux (%)
                                              </Label>
                                              <Input
                                                id="edit-tax-rate"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={editingTaxRate.rate}
                                                onChange={(e) =>
                                                  setEditingTaxRate({
                                                    ...editingTaxRate,
                                                    rate: Number.parseFloat(e.target.value),
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-tax-default" className="text-right">
                                                Par défaut
                                              </Label>
                                              <div className="col-span-3">
                                                <Switch
                                                  id="edit-tax-default"
                                                  checked={editingTaxRate.isDefault}
                                                  onCheckedChange={(checked) =>
                                                    setEditingTaxRate({ ...editingTaxRate, isDefault: checked })
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <DialogFooter>
                                          <Button type="submit" onClick={handleUpdateTaxRate}>
                                            Enregistrer
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setTaxRateToDelete(tax.id)}>
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action ne peut pas être annulée. Cela supprimera définitivement le
                                            taux de TVA.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteTaxRate(tax.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle>Méthodes de paiement</CardTitle>
                          <CardDescription>Gérez les méthodes de paiement acceptées</CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Ajouter une méthode de paiement</DialogTitle>
                              <DialogDescription>
                                Créez une nouvelle méthode de paiement pour vos factures.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment-name" className="text-right">
                                  Nom
                                </Label>
                                <Input
                                  id="payment-name"
                                  value={newPaymentMethod.name}
                                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment-description" className="text-right">
                                  Description
                                </Label>
                                <Input
                                  id="payment-description"
                                  value={newPaymentMethod.description}
                                  onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, description: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payment-active" className="text-right">
                                  Actif
                                </Label>
                                <div className="col-span-3">
                                  <Switch
                                    id="payment-active"
                                    checked={newPaymentMethod.isActive}
                                    onCheckedChange={(checked) =>
                                      setNewPaymentMethod({ ...newPaymentMethod, isActive: checked })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleAddPaymentMethod}>
                                Ajouter
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Statut</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentMethods.map((method) => (
                              <TableRow key={method.id}>
                                <TableCell className="font-medium">{method.name}</TableCell>
                                <TableCell>{method.description}</TableCell>
                                <TableCell>
                                  {method.isActive ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Actif
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      Inactif
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingPaymentMethod(method)}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Modifier la méthode de paiement</DialogTitle>
                                          <DialogDescription>
                                            Modifiez les informations de la méthode de paiement.
                                          </DialogDescription>
                                        </DialogHeader>
                                        {editingPaymentMethod && (
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-payment-name" className="text-right">
                                                Nom
                                              </Label>
                                              <Input
                                                id="edit-payment-name"
                                                value={editingPaymentMethod.name}
                                                onChange={(e) =>
                                                  setEditingPaymentMethod({
                                                    ...editingPaymentMethod,
                                                    name: e.target.value,
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-payment-description" className="text-right">
                                                Description
                                              </Label>
                                              <Input
                                                id="edit-payment-description"
                                                value={editingPaymentMethod.description}
                                                onChange={(e) =>
                                                  setEditingPaymentMethod({
                                                    ...editingPaymentMethod,
                                                    description: e.target.value,
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-payment-active" className="text-right">
                                                Actif
                                              </Label>
                                              <div className="col-span-3">
                                                <Switch
                                                  id="edit-payment-active"
                                                  checked={editingPaymentMethod.isActive}
                                                  onCheckedChange={(checked) =>
                                                    setEditingPaymentMethod({
                                                      ...editingPaymentMethod,
                                                      isActive: checked,
                                                    })
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <DialogFooter>
                                          <Button type="submit" onClick={handleUpdatePaymentMethod}>
                                            Enregistrer
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setPaymentMethodToDelete(method.id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action ne peut pas être annulée. Cela supprimera définitivement la
                                            méthode de paiement.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeletePaymentMethod(method.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Chart of Accounts */}
                    <Card className="md:col-span-2">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle>Plan comptable</CardTitle>
                          <CardDescription>Gérez votre plan comptable</CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Ajouter un compte</DialogTitle>
                              <DialogDescription>Créez un nouveau compte dans votre plan comptable.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-code" className="text-right">
                                  Code
                                </Label>
                                <Input
                                  id="account-code"
                                  value={newChartAccount.code}
                                  onChange={(e) => setNewChartAccount({ ...newChartAccount, code: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-name" className="text-right">
                                  Nom
                                </Label>
                                <Input
                                  id="account-name"
                                  value={newChartAccount.name}
                                  onChange={(e) => setNewChartAccount({ ...newChartAccount, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-type" className="text-right">
                                  Type
                                </Label>
                                <Select
                                  onValueChange={(value) => setNewChartAccount({ ...newChartAccount, type: value })}
                                  value={newChartAccount.type}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Sélectionnez un type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Capitaux">Capitaux</SelectItem>
                                    <SelectItem value="Immobilisations">Immobilisations</SelectItem>
                                    <SelectItem value="Stocks">Stocks</SelectItem>
                                    <SelectItem value="Créances">Créances</SelectItem>
                                    <SelectItem value="Trésorerie">Trésorerie</SelectItem>
                                    <SelectItem value="Dettes">Dettes</SelectItem>
                                    <SelectItem value="Charges">Charges</SelectItem>
                                    <SelectItem value="Produits">Produits</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account-description" className="text-right">
                                  Description
                                </Label>
                                <Input
                                  id="account-description"
                                  value={newChartAccount.description}
                                  onChange={(e) =>
                                    setNewChartAccount({ ...newChartAccount, description: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleAddChartAccount}>
                                Ajouter
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Nom</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {chartAccounts.map((account) => (
                              <TableRow key={account.id}>
                                <TableCell className="font-medium">{account.code}</TableCell>
                                <TableCell>{account.name}</TableCell>
                                <TableCell>{account.type}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{account.description}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingChartAccount(account)}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Modifier le compte</DialogTitle>
                                          <DialogDescription>Modifiez les informations du compte.</DialogDescription>
                                        </DialogHeader>
                                        {editingChartAccount && (
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-account-code" className="text-right">
                                                Code
                                              </Label>
                                              <Input
                                                id="edit-account-code"
                                                value={editingChartAccount.code}
                                                onChange={(e) =>
                                                  setEditingChartAccount({
                                                    ...editingChartAccount,
                                                    code: e.target.value,
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-account-name" className="text-right">
                                                Nom
                                              </Label>
                                              <Input
                                                id="edit-account-name"
                                                value={editingChartAccount.name}
                                                onChange={(e) =>
                                                  setEditingChartAccount({
                                                    ...editingChartAccount,
                                                    name: e.target.value,
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-account-type" className="text-right">
                                                Type
                                              </Label>
                                              <Select
                                                onValueChange={(value) =>
                                                  setEditingChartAccount({ ...editingChartAccount, type: value })
                                                }
                                                value={editingChartAccount.type}
                                              >
                                                <SelectTrigger className="col-span-3">
                                                  <SelectValue placeholder="Sélectionnez un type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="Capitaux">Capitaux</SelectItem>
                                                  <SelectItem value="Immobilisations">Immobilisations</SelectItem>
                                                  <SelectItem value="Stocks">Stocks</SelectItem>
                                                  <SelectItem value="Créances">Créances</SelectItem>
                                                  <SelectItem value="Trésorerie">Trésorerie</SelectItem>
                                                  <SelectItem value="Dettes">Dettes</SelectItem>
                                                  <SelectItem value="Charges">Charges</SelectItem>
                                                  <SelectItem value="Produits">Produits</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <Label htmlFor="edit-account-description" className="text-right">
                                                Description
                                              </Label>
                                              <Input
                                                id="edit-account-description"
                                                value={editingChartAccount.description}
                                                onChange={(e) =>
                                                  setEditingChartAccount({
                                                    ...editingChartAccount,
                                                    description: e.target.value,
                                                  })
                                                }
                                                className="col-span-3"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        <DialogFooter>
                                          <Button type="submit" onClick={handleUpdateChartAccount}>
                                            Enregistrer
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setChartAccountToDelete(account.id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action ne peut pas être annulée. Cela supprimera définitivement le
                                            compte.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteChartAccount(account.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="api" className="space-y-4 mt-4">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>API & Intégrations</CardTitle>
                  <CardDescription>
                    Configurez les clés API et les intégrations avec des services externes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ocrApiKey">Clé API OCR.space</Label>
                    <Input
                      id="ocrApiKey"
                      type="password"
                      value={apiSettings.ocrApiKey}
                      onChange={(e) => handleApiChange("ocrApiKey", e.target.value)}
                      placeholder="Entrez votre clé API OCR.space"
                    />
                    <p className="text-sm text-muted-foreground">
                      Obtenez une clé API gratuite sur{" "}
                      <a
                        href="https://ocr.space/ocrapi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OCR.space
                      </a>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ocrLanguage">Langue OCR</Label>
                    <Select
                      onValueChange={(value) => handleApiChange("ocrLanguage", value)}
                      defaultValue={apiSettings.ocrLanguage}
                    >
                      <SelectTrigger id="ocrLanguage">
                        <SelectValue placeholder="Sélectionnez une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fre">Français</SelectItem>
                        <SelectItem value="eng">Anglais</SelectItem>
                        <SelectItem value="ara">Arabe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configurez vos préférences de notification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationsSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="invoiceReminders">Rappels de factures</Label>
                      <p className="text-sm text-muted-foreground">Recevoir des rappels pour les factures à échéance</p>
                    </div>
                    <Switch
                      id="invoiceReminders"
                      checked={notificationsSettings.invoiceReminders}
                      onCheckedChange={(checked) => handleNotificationChange("invoiceReminders", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="systemUpdates">Mises à jour système</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications sur les mises à jour du système
                      </p>
                    </div>
                    <Switch
                      id="systemUpdates"
                      checked={notificationsSettings.systemUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-4">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>Personnalisez l'apparence de l'application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Mode sombre</Label>
                      <p className="text-sm text-muted-foreground">Activer le mode sombre pour l'interface</p>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={appearanceSettings.darkMode}
                      onCheckedChange={(checked) => handleAppearanceChange("darkMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactMode">Mode compact</Label>
                      <p className="text-sm text-muted-foreground">
                        Réduire l'espacement pour afficher plus de contenu
                      </p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) => handleAppearanceChange("compactMode", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="highContrast">Contraste élevé</Label>
                      <p className="text-sm text-muted-foreground">
                        Augmenter le contraste pour une meilleure lisibilité
                      </p>
                    </div>
                    <Switch
                      id="highContrast"
                      checked={appearanceSettings.highContrast}
                      onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
