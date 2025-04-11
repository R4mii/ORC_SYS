"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Partner {
  id: string
  name: string
  type: "individual" | "company"
  isSupplier: boolean
  isClient: boolean
  address: {
    line1: string
    line2: string
    city: string
    country: string
  }
  identifiers: {
    ice: string
    if: string
    rc: string
    pat: string
  }
  contact: {
    phone: string
    mobile: string
    email: string
  }
  language: string
}

interface PartnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (partner: Partner) => void
  initialPartner?: Partner
}

export function PartnerModal({ isOpen, onClose, onSave, initialPartner }: PartnerModalProps) {
  const [partner, setPartner] = useState<Partner>(
    initialPartner || {
      id: "",
      name: "",
      type: "company",
      isSupplier: true,
      isClient: false,
      address: {
        line1: "",
        line2: "",
        city: "",
        country: "Maroc",
      },
      identifiers: {
        ice: "",
        if: "",
        rc: "",
        pat: "",
      },
      contact: {
        phone: "",
        mobile: "",
        email: "",
      },
      language: "French / Français",
    },
  )

  const handleChange = (field: string, value: any) => {
    const fields = field.split(".")

    if (fields.length === 1) {
      setPartner({ ...partner, [field]: value })
    } else if (fields.length === 2) {
      const [parent, child] = fields
      setPartner({
        ...partner,
        [parent]: {
          ...partner[parent as keyof Partner],
          [child]: value,
        },
      })
    }
  }

  const handleSave = () => {
    onSave(partner)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Ouvrir : Partenaire</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
          <RadioGroup
            value={partner.type}
            onValueChange={(value) => handleChange("type", value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="font-normal">
                Individu
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company" className="font-normal">
                Société
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Input
              value={partner.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nom du partenaire"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="supplier"
                checked={partner.isSupplier}
                onCheckedChange={(checked) => handleChange("isSupplier", checked)}
              />
              <Label htmlFor="supplier">Fournisseur</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="client"
                checked={partner.isClient}
                onCheckedChange={(checked) => handleChange("isClient", checked)}
              />
              <Label htmlFor="client">Client</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-line1">Adresse</Label>
                <Input
                  id="address-line1"
                  value={partner.address.line1}
                  onChange={(e) => handleChange("address.line1", e.target.value)}
                  placeholder="Ligne 1"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="address-line2"
                  value={partner.address.line2}
                  onChange={(e) => handleChange("address.line2", e.target.value)}
                  placeholder="Ligne 2"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="address-city"
                  value={partner.address.city}
                  onChange={(e) => handleChange("address.city", e.target.value)}
                  placeholder="Ville"
                />
              </div>

              <div className="space-y-2">
                <Select
                  value={partner.address.country}
                  onValueChange={(value) => handleChange("address.country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maroc">Maroc</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Algérie">Algérie</SelectItem>
                    <SelectItem value="Tunisie">Tunisie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ice">ICE</Label>
                <Input
                  id="ice"
                  value={partner.identifiers.ice}
                  onChange={(e) => handleChange("identifiers.ice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="if">IF</Label>
                <Input
                  id="if"
                  value={partner.identifiers.if}
                  onChange={(e) => handleChange("identifiers.if", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rc">RC</Label>
                <Input
                  id="rc"
                  value={partner.identifiers.rc}
                  onChange={(e) => handleChange("identifiers.rc", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pat">PAT</Label>
                <Input
                  id="pat"
                  value={partner.identifiers.pat}
                  onChange={(e) => handleChange("identifiers.pat", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={partner.contact.phone}
                onChange={(e) => handleChange("contact.phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={partner.contact.mobile}
                onChange={(e) => handleChange("contact.mobile", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Courriel</Label>
            <Input
              id="email"
              type="email"
              value={partner.contact.email}
              onChange={(e) => handleChange("contact.email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select value={partner.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="French / Français">French / Français</SelectItem>
                <SelectItem value="English / Anglais">English / Anglais</SelectItem>
                <SelectItem value="Arabic / Arabe">Arabic / Arabe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Sauver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
