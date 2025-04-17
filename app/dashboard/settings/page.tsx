"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Save, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      companyName: "",
      fiscalYear: "",
      language: "fr",
      currency: "MAD",
    },
    notifications: {
      emailNotifications: false,
      invoiceReminders: false,
      systemUpdates: true,
    },
    appearance: {
      darkMode: false,
      compactMode: false,
      highContrast: false,
    },
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Set appearance settings based on current theme
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        darkMode: theme === "dark",
      },
    }))
  }, [theme])

  // Handle input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value,
      },
    })
  }

  // Handle appearance changes
  const handleAppearanceChange = (field: string, value: boolean) => {
    // Update settings state
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        [field]: value,
      },
    })

    // Apply theme change if darkMode is toggled
    if (field === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  // Save settings
  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings))

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  // Reset settings
  const resetSettings = () => {
    const defaultSettings = {
      general: {
        companyName: "",
        fiscalYear: "",
        language: "fr",
        currency: "MAD",
      },
      notifications: {
        emailNotifications: false,
        invoiceReminders: false,
        systemUpdates: true,
      },
      appearance: {
        darkMode: theme === "dark",
        compactMode: false,
        highContrast: false,
      },
    }

    setSettings(defaultSettings)
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to default values.",
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
            <Button size="sm" onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <Card className="border-none shadow-none">
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                  <CardDescription>Configurez les paramètres généraux de votre compte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      value={settings.general.companyName}
                      onChange={(e) => handleInputChange("general", "companyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Exercice fiscal</Label>
                    <Input
                      id="fiscalYear"
                      value={settings.general.fiscalYear}
                      onChange={(e) => handleInputChange("general", "fiscalYear", e.target.value)}
                      placeholder="01-01-2024 / 31-12-2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <select
                      id="language"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={settings.general.language}
                      onChange={(e) => handleInputChange("general", "language", e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <select
                      id="currency"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={settings.general.currency}
                      onChange={(e) => handleInputChange("general", "currency", e.target.value)}
                    >
                      <option value="MAD">Dirham marocain (MAD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
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
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange("notifications", "emailNotifications", checked)}
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
                      checked={settings.notifications.invoiceReminders}
                      onCheckedChange={(checked) => handleInputChange("notifications", "invoiceReminders", checked)}
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
                      checked={settings.notifications.systemUpdates}
                      onCheckedChange={(checked) => handleInputChange("notifications", "systemUpdates", checked)}
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
                      checked={settings.appearance.darkMode}
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
                      checked={settings.appearance.compactMode}
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
                      checked={settings.appearance.highContrast}
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
